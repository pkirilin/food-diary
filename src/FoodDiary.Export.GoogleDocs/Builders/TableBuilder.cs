using Google.Apis.Docs.v1.Data;
using Range = Google.Apis.Docs.v1.Data.Range;

namespace FoodDiary.Export.GoogleDocs.Builders;

internal class TableBuilder
{
    private class Cell
    {
        public string Text { get; }
        public int StartLocationIndex { get; set; }
        public int EndLocationIndex => StartLocationIndex + Text.Length;

        public Cell(string text)
        {
            Text = text;
        }
    }

    private readonly List<Request> _requests;
    private readonly List<List<Cell>> _cells = new();
    private readonly Location _tableStartLocation;
    private readonly LocationIndex _currentLocationIndex;
    private readonly int _tableInsertRequestIndex;
    private readonly int _tableInsertLocationIndex;

    public TableBuilder(LocationIndex currentLocationIndex, List<Request> requests)
    {
        _currentLocationIndex = currentLocationIndex;
        _requests = requests;
        _tableInsertRequestIndex = requests.Count;
        _tableInsertLocationIndex = currentLocationIndex.Value;

        _currentLocationIndex.Value++;
        _tableStartLocation = new Location
        {
            Index = _currentLocationIndex.Value
        };
    }

    public int RowCount => _cells.Count;
    public int ColumnCount => _cells.Max(c => c.Count);

    public void AddRow(IEnumerable<string> values)
    {
        var row = values.Select(text => new Cell(text)).ToList();

        _cells.Add(row);
        _currentLocationIndex.Value++;

        foreach (var cell in row)
        {
            _currentLocationIndex.Value += 2;
            cell.StartLocationIndex = _currentLocationIndex.Value;

            if (string.IsNullOrWhiteSpace(cell.Text))
                continue;
            
            _requests.Add(new Request
            {
                InsertText = new InsertTextRequest
                {
                    Text = cell.Text,
                    Location = new Location
                    {
                        Index = _currentLocationIndex.Value
                    }
                }
            });
            
            _currentLocationIndex.Value += cell.Text.Length;
        }
    }
    
    public void AddRows(IEnumerable<IEnumerable<string>> rows)
    {
        foreach (var row in rows)
        {
            AddRow(row);
        }
    }

    public void MergeCells(int rowIndex, int columnIndex, int rowSpan, int columnSpan)
    {
        _requests.Add(new Request
        {
            MergeTableCells = new MergeTableCellsRequest
            {
                TableRange = new TableRange
                {
                    RowSpan = rowSpan,
                    ColumnSpan = columnSpan,
                    TableCellLocation = new TableCellLocation
                    {
                        RowIndex = rowIndex,
                        ColumnIndex = columnIndex,
                        TableStartLocation = _tableStartLocation
                    }
                }
            }
        });
    }

    public void SetColumnWidths(IEnumerable<double> widths)
    {
        var setWidthRequests = widths.Select((magnutude, columnIndex) => new Request
        {
            UpdateTableColumnProperties = new UpdateTableColumnPropertiesRequest
            {
                Fields = "*",
                ColumnIndices = new List<int?> { columnIndex },
                TableColumnProperties = new TableColumnProperties
                {
                    Width = new Dimension
                    {
                        Magnitude = magnutude,
                        Unit = "PT"
                    },
                    WidthType = "FIXED_WIDTH"
                },
                TableStartLocation = _tableStartLocation
            }
        });
        
        _requests.AddRange(setWidthRequests);
    }

    public void SetBoldAndItalic(int rowIndex, int columnIndex, int rowSpan, int columnSpan)
    {
        for (var i = rowIndex; i < rowIndex + rowSpan; i++)
        {
            for (var j = columnIndex; j < columnIndex + columnSpan; j++)
            {
                _requests.Add(new Request
                {
                    UpdateTextStyle = new UpdateTextStyleRequest
                    {
                        Fields = "*",
                        Range = new Range
                        {
                            StartIndex = _cells[i][j].StartLocationIndex,
                            EndIndex = _cells[i][j].EndLocationIndex
                        },
                        TextStyle = new TextStyle
                        {
                            Bold = true,
                            Italic = true
                        }
                    }
                });
            }
        }
    }

    public void EndTable()
    {
        AddTable();
        AlignCellsVertical();
        AlignCellsHorizontal();
    }

    private void AddTable()
    {
        _requests.Insert(_tableInsertRequestIndex, new Request
        {
            InsertTable = new InsertTableRequest
            {
                Rows = RowCount,
                Columns = ColumnCount,
                Location = new Location
                {
                    Index = _tableInsertLocationIndex
                }
            }
        });
        
        _currentLocationIndex.Value += 2;
    }

    private void AlignCellsVertical()
    {
        _requests.Add(new Request
        {
            UpdateTableCellStyle = new UpdateTableCellStyleRequest
            {
                Fields = "*",
                TableStartLocation = _tableStartLocation,
                TableCellStyle = new TableCellStyle
                {
                    ContentAlignment = "MIDDLE"
                }
            }
        });
    }

    private void AlignCellsHorizontal()
    {
        var cells = _cells.SelectMany(row => row).Where(cell => !string.IsNullOrWhiteSpace(cell.Text));
        
        foreach (var cell in cells)
        {
            _requests.Add(new Request
            {
                UpdateParagraphStyle = new UpdateParagraphStyleRequest
                {
                    Fields = "alignment",
                    Range = new Range
                    {
                        StartIndex = cell.StartLocationIndex,
                        EndIndex = cell.EndLocationIndex - 1
                    },
                    ParagraphStyle = new ParagraphStyle
                    {
                        Alignment = "CENTER"
                    }
                }
            });
        }
    }
}