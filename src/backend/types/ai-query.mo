module {
  public type ColumnType = { #text; #number; #date };

  public type ColumnDefinition = {
    name : Text;
    colType : ColumnType;
  };

  public type ChartType = { #bar; #pie; #none };

  public type ChartData = {
    labels : [Text];
    values : [Float];
  };

  public type QueryResult = {
    answer : Text;
    chartType : ChartType;
    chartData : ?ChartData;
  };

  public type QueryRecord = {
    id : Nat;
    question : Text;
    result : QueryResult;
    timestamp : Int;
  };

  public type DatasetSchema = {
    columns : [ColumnDefinition];
  };
};
