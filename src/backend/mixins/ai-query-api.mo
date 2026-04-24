import Types "../types/ai-query";
import AiQueryLib "../lib/ai-query";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import List "mo:core/List";
import Time "mo:core/Time";
import Text "mo:core/Text";

mixin () {
  /// Mutable session state owned by this mixin.
  var _schema : ?Types.DatasetSchema = null;
  var _dataRows : Text = "";
  let _history = List.empty<Types.QueryRecord>();
  var _nextQueryId : Nat = 0;

  /// Transform callback required by the IC HTTP outcall mechanism.
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input)
  };

  /// Upload/replace the dataset schema (column definitions).
  public shared func setDatasetSchema(columns : [Types.ColumnDefinition]) : async () {
    _schema := AiQueryLib.setSchema(columns);
  };

  /// Upload data rows as a JSON-encoded string for AI analysis.
  public shared func setDataRows(rows : Text) : async () {
    _dataRows := rows;
  };

  /// Get the current dataset schema, if any.
  public query func getDatasetSchema() : async ?Types.DatasetSchema {
    _schema
  };

  /// Submit a natural language question; calls the AI service and returns the result.
  public shared func queryData(question : Text) : async Types.QueryResult {
    let schema = switch (_schema) {
      case (?s) s;
      case null {
        return {
          answer = "No dataset schema has been set. Please upload a dataset first.";
          chartType = #none;
          chartData = null;
        };
      };
    };

    let prompt = AiQueryLib.buildAiPrompt(schema, _dataRows, question);

    // Call the AI API via HTTP outcall (OpenAI-compatible endpoint)
    let body = buildOpenAiRequestBody(prompt);
    let rawResponse = await OutCall.httpPostRequest(
      "https://api.openai.com/v1/chat/completions",
      [
        { name = "Content-Type"; value = "application/json" },
        { name = "Authorization"; value = "Bearer OPENAI_API_KEY" },
      ],
      body,
      transform,
    );

    // Extract the assistant's message content from the OpenAI response
    let aiContent = extractOpenAiContent(rawResponse);
    let result = AiQueryLib.parseAiResponse(aiContent);

    // Store in history
    let record = AiQueryLib.makeQueryRecord(_nextQueryId, question, result, Time.now());
    _history.add(record);
    _nextQueryId += 1;

    result
  };

  /// Get the query history for the current session.
  public query func getQueryHistory() : async [Types.QueryRecord] {
    AiQueryLib.getHistory(_history)
  };

  /// Clear all session data (schema, rows, history).
  public shared func clearSession() : async () {
    _schema := null;
    _dataRows := "";
    _history.clear();
    _nextQueryId := 0;
  };

  /// Build an OpenAI chat completions request body.
  func buildOpenAiRequestBody(prompt : Text) : Text {
    // Escape the prompt for safe JSON embedding
    let escaped = escapeJsonString(prompt);
    "{\"model\":\"gpt-4o-mini\",\"messages\":[{\"role\":\"user\",\"content\":\"" # escaped # "\"}],\"temperature\":0.2}"
  };

  /// Escape special characters for JSON string embedding.
  func escapeJsonString(text : Text) : Text {
    var result = "";
    for (c in text.toIter()) {
      let ch = Text.fromChar(c);
      if (ch == "\"") { result := result # "\\\"" }
      else if (ch == "\\") { result := result # "\\\\" }
      else if (ch == "\n") { result := result # "\\n" }
      else if (ch == "\r") { result := result # "\\r" }
      else if (ch == "\t") { result := result # "\\t" }
      else { result := result # ch }
    };
    result
  };

  /// Extract the assistant message content from an OpenAI JSON response.
  /// Returns the raw response text if extraction fails.
  func extractOpenAiContent(response : Text) : Text {
    // Look for "content":"<value>" inside choices[0].message
    let contentKey = "\"content\"";
    let parts = response.split(#text(contentKey));
    var iter = parts;
    switch (iter.next()) {
      case null return response;
      case (?_) {};
    };
    switch (iter.next()) {
      case null return response;
      case (?afterKey) {
        // afterKey: ":"<the actual content>"
        let afterColon = skipToFirstQuote(afterKey);
        let value = extractQuotedValue(afterColon);
        if (value == "") response else unescapeJson(value)
      };
    }
  };

  func skipToFirstQuote(text : Text) : Text {
    var found = false;
    var result = "";
    for (c in text.toIter()) {
      let ch = Text.fromChar(c);
      if (found) { result := result # ch }
      else if (ch == "\"") { found := true }
    };
    result
  };

  func extractQuotedValue(text : Text) : Text {
    var result = "";
    var escaped = false;
    for (c in text.toIter()) {
      let ch = Text.fromChar(c);
      if (escaped) {
        result := result # ch;
        escaped := false;
      } else if (ch == "\\") {
        result := result # "\\";
        escaped := true;
      } else if (ch == "\"") {
        return result;
      } else {
        result := result # ch;
      }
    };
    result
  };

  func unescapeJson(text : Text) : Text {
    var result = "";
    var escaped = false;
    for (c in text.toIter()) {
      let ch = Text.fromChar(c);
      if (escaped) {
        if (ch == "n") { result := result # "\n" }
        else if (ch == "r") { result := result # "\r" }
        else if (ch == "t") { result := result # "\t" }
        else if (ch == "\"") { result := result # "\"" }
        else if (ch == "\\") { result := result # "\\" }
        else { result := result # "\\" # ch };
        escaped := false;
      } else if (ch == "\\") {
        escaped := true;
      } else {
        result := result # ch;
      }
    };
    result
  };
};
