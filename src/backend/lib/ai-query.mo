import Types "../types/ai-query";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Text "mo:core/Text";

module {
  /// Build the schema portion of the AI prompt.
  func schemaToText(schema : Types.DatasetSchema) : Text {
    let cols = schema.columns.map(func(c : Types.ColumnDefinition) : Text {
      let typeName = switch (c.colType) {
        case (#text) "text";
        case (#number) "number";
        case (#date) "date";
      };
      c.name # " (" # typeName # ")"
    });
    "Columns: " # cols.values().join(", ")
  };

  /// Create a new DatasetSchema from column definitions.
  public func setSchema(columns : [Types.ColumnDefinition]) : ?Types.DatasetSchema {
    ?{ columns }
  };

  /// Build the full prompt to send to the AI service.
  public func buildAiPrompt(
    schema : Types.DatasetSchema,
    dataRows : Text,
    question : Text,
  ) : Text {
    let schemaPart = schemaToText(schema);
    "You are a data analyst. Given the following dataset, answer the user's question.\n\n" #
    schemaPart # "\n\n" #
    "Data (JSON array of rows):\n" # dataRows # "\n\n" #
    "Question: " # question # "\n\n" #
    "Respond ONLY with a valid JSON object with these exact fields:\n" #
    "{\n" #
    "  \"answer\": \"<plain text answer>\",\n" #
    "  \"chartType\": \"bar\" | \"pie\" | \"none\",\n" #
    "  \"chartData\": { \"labels\": [\"label1\", ...], \"values\": [1.0, ...] } | null\n" #
    "}\n" #
    "Use chartType \"none\" and null chartData when no chart is needed.\n" #
    "Use \"bar\" for comparisons/rankings, \"pie\" for proportions/distributions.\n" #
    "Ensure values are numbers (floats). Do not include any text outside the JSON object."
  };

  /// Parse the AI JSON response into a QueryResult.
  /// Performs best-effort extraction; falls back to plain-text answer on parse failure.
  public func parseAiResponse(rawResponse : Text) : Types.QueryResult {
    // Try to extract JSON object boundaries
    let trimmed = rawResponse.trim(#predicate(func(c) { let ch = Text.fromChar(c); ch == " " or ch == "\n" or ch == "\r" or ch == "\t" }));

    // Attempt to find the JSON block
    let jsonText = switch (findJsonObject(trimmed)) {
      case (?j) j;
      case null trimmed;
    };

    // Extract fields
    let answer = extractStringField(jsonText, "answer");
    let chartTypeText = extractStringField(jsonText, "chartType");
    let chartType : Types.ChartType = switch (chartTypeText) {
      case "bar" #bar;
      case "pie" #pie;
      case _ #none;
    };
    let chartData : ?Types.ChartData = if (chartType == #none) {
      null
    } else {
      extractChartData(jsonText)
    };

    {
      answer = if (answer == "") rawResponse else answer;
      chartType;
      chartData;
    }
  };

  /// Find the outermost JSON object in a string.
  func findJsonObject(text : Text) : ?Text {
    var depth = 0;
    var start : ?Nat = null;
    var idx = 0;
    for (c in text.toIter()) {
      if (c == '{') {
        if (depth == 0) { start := ?idx };
        depth += 1;
      } else if (c == '}') {
        depth -= 1;
        if (depth == 0) {
          switch (start) {
            case (?s) {
              // Extract substring from s to idx+1
              return ?textSlice(text, s, idx + 1);
            };
            case null {};
          }
        };
      };
      idx += 1;
    };
    null
  };

  /// Extract a text slice by character indices [from, to).
  func textSlice(text : Text, from : Nat, to : Nat) : Text {
    var result = "";
    var idx = 0;
    for (c in text.toIter()) {
      if (idx >= from and idx < to) {
        result := result # Text.fromChar(c);
      };
      idx += 1;
    };
    result
  };

  /// Extract a string field value from a JSON-like object string.
  func extractStringField(json : Text, fieldName : Text) : Text {
    let pattern = "\"" # fieldName # "\"";
    // Find the field name
    let parts = json.split(#text(pattern));
    var iter = parts;
    switch (iter.next()) {
      case null return "";
      case (?_) {};
    };
    switch (iter.next()) {
      case null return "";
      case (?afterKey) {
        // afterKey starts with something like: ": \"value\""
        // Skip whitespace and colon
        let afterColon = skipToFirstQuote(afterKey);
        extractQuotedValue(afterColon)
      };
    }
  };

  /// Skip characters until we hit a `"` character, then return remaining text.
  func skipToFirstQuote(text : Text) : Text {
    var found = false;
    var result = "";
    for (c in text.toIter()) {
      let ch = Text.fromChar(c);
      if (found) {
        result := result # ch;
      } else if (ch == "\"") {
        found := true;
      }
    };
    result
  };

  /// Extract value up to the next unescaped `"`.
  func extractQuotedValue(text : Text) : Text {
    var result = "";
    var escaped = false;
    for (c in text.toIter()) {
      let ch = Text.fromChar(c);
      if (escaped) {
        result := result # ch;
        escaped := false;
      } else if (ch == "\\") {
        escaped := true;
      } else if (ch == "\"") {
        return result;
      } else {
        result := result # ch;
      }
    };
    result
  };

  /// Extract chartData object from JSON string.
  func extractChartData(json : Text) : ?Types.ChartData {
    // Find "chartData" key
    let cdParts = json.split(#text("\"chartData\""));
    var cdIter = cdParts;
    switch (cdIter.next()) {
      case null return null;
      case (?_) {};
    };
    switch (cdIter.next()) {
      case null return null;
      case (?afterKey) {
        // Check for null value
        let trimmedAfter = afterKey.trim(#predicate(func(c) { let ch = Text.fromChar(c); ch == " " or ch == "\n" or ch == "\r" or ch == ":" or ch == "\t" }));
        if (trimmedAfter.startsWith(#text("null"))) return null;
        // Extract the nested object
        switch (findJsonObject(afterKey)) {
          case null return null;
          case (?cdJson) {
            let labels = extractArrayStrings(cdJson, "labels");
            let values = extractArrayNumbers(cdJson, "values");
            if (labels.size() == 0 and values.size() == 0) null
            else ?{ labels; values }
          };
        }
      };
    }
  };

  /// Extract a JSON string array field.
  func extractArrayStrings(json : Text, fieldName : Text) : [Text] {
    let pattern = "\"" # fieldName # "\"";
    let parts = json.split(#text(pattern));
    var iter = parts;
    switch (iter.next()) {
      case null return [];
      case (?_) {};
    };
    switch (iter.next()) {
      case null return [];
      case (?afterKey) {
        switch (findJsonArray(afterKey)) {
          case null [];
          case (?arrText) parseStringArray(arrText);
        }
      };
    }
  };

  /// Extract a JSON number array field.
  func extractArrayNumbers(json : Text, fieldName : Text) : [Float] {
    let pattern = "\"" # fieldName # "\"";
    let parts = json.split(#text(pattern));
    var iter = parts;
    switch (iter.next()) {
      case null return [];
      case (?_) {};
    };
    switch (iter.next()) {
      case null return [];
      case (?afterKey) {
        switch (findJsonArray(afterKey)) {
          case null [];
          case (?arrText) parseNumberArray(arrText);
        }
      };
    }
  };

  /// Find the first JSON array `[...]` in a string.
  func findJsonArray(text : Text) : ?Text {
    var depth = 0;
    var start : ?Nat = null;
    var idx = 0;
    for (c in text.toIter()) {
      if (c == '[') {
        if (depth == 0) { start := ?idx };
        depth += 1;
      } else if (c == ']') {
        depth -= 1;
        if (depth == 0) {
          switch (start) {
            case (?s) return ?textSlice(text, s + 1, idx);
            case null {};
          }
        };
      };
      idx += 1;
    };
    null
  };

  /// Parse a comma-separated list of quoted strings from inside `[...]`.
  func parseStringArray(inner : Text) : [Text] {
    let result = List.empty<Text>();
    // Split on commas, then strip quotes
    for (item in inner.split(#char(','))) {
    let trimmed = item.trim(#predicate(func(c) { 
        let ch = Text.fromChar(c);
        ch == " " or ch == "\n" or ch == "\r" or ch == "\t" or ch == "\"" 
      }));
      if (not trimmed.isEmpty()) {
        result.add(trimmed);
      }
    };
    result.toArray()
  };

  /// Parse a comma-separated list of numbers from inside `[...]`.
  func parseNumberArray(inner : Text) : [Float] {
    let result = List.empty<Float>();
    for (item in inner.split(#char(','))) {
      let trimmed = item.trim(#predicate(func(c) { let ch = Text.fromChar(c); ch == " " or ch == "\n" or ch == "\r" or ch == "\t" }));
      switch (parseFloat(trimmed)) {
        case (?f) result.add(f);
        case null {};
      }
    };
    result.toArray()
  };

  /// Simple float parser.
  func parseFloat(text : Text) : ?Float {
    // Handle empty
    if (text.isEmpty()) return null;
    // Try integer first
    switch (Nat.fromText(text)) {
      case (?n) return ?(n.toFloat());
      case null {};
    };
    // Try negative integer
    if (text.startsWith(#char('-'))) {
      let rest = textSlice(text, 1, text.size());
      switch (Nat.fromText(rest)) {
        case (?n) return ?(-(n.toFloat()));
        case null {};
      }
    };
    // Try decimal: split on '.'
    let dotParts = text.split(#char('.'));
    var dpIter = dotParts;
    switch (dpIter.next()) {
      case null return null;
      case (?intPartText) {
        switch (dpIter.next()) {
          case null return null;
          case (?fracPartText) {
            let negative = intPartText.startsWith(#char('-'));
            let absIntText = if (negative) textSlice(intPartText, 1, intPartText.size()) else intPartText;
            switch (Nat.fromText(absIntText)) {
              case null return null;
              case (?intPart) {
                switch (Nat.fromText(fracPartText)) {
                  case null return null;
                  case (?fracPart) {
                    let fracSize = fracPartText.size();
                    var divisor : Float = 1.0;
                    var i = 0;
                    while (i < fracSize) { divisor *= 10.0; i += 1 };
                    let value = intPart.toFloat() + fracPart.toFloat() / divisor;
                    ?(if (negative) -value else value)
                  };
                }
              };
            }
          };
        }
      };
    }
  };

  /// Create a new QueryRecord.
  public func makeQueryRecord(
    nextId : Nat,
    question : Text,
    result : Types.QueryResult,
    timestamp : Int,
  ) : Types.QueryRecord {
    { id = nextId; question; result; timestamp }
  };

  /// Return query history as an immutable array.
  public func getHistory(history : List.List<Types.QueryRecord>) : [Types.QueryRecord] {
    history.toArray()
  };
};
