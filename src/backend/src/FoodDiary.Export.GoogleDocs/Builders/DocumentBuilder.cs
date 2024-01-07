using System.Runtime.CompilerServices;
using Google.Apis.Docs.v1.Data;
using Range = Google.Apis.Docs.v1.Data.Range;

[assembly:InternalsVisibleTo("FoodDiary.UnitTests")]

namespace FoodDiary.Export.GoogleDocs.Builders;

internal class DocumentBuilder
{
    private readonly List<Request> _requests = new();
    private readonly LocationIndex _currentLocationIndex = new();

    public void AddHeader(string text)
    {
        _requests.AddRange(new []
        {
            new Request
            {
                InsertText = new InsertTextRequest
                {
                    Text = text,
                    Location = new Location
                    {
                        Index = _currentLocationIndex.Value
                    }
                }
            },
            new Request
            {
                UpdateParagraphStyle = new UpdateParagraphStyleRequest
                {
                    Fields = "*",
                    ParagraphStyle = new ParagraphStyle
                    {
                        NamedStyleType = "HEADING_1",
                        Alignment = "CENTER"
                    },
                    Range = new Range
                    {
                        StartIndex = _currentLocationIndex.Value,
                        EndIndex = _currentLocationIndex.Value + text.Length
                    }
                }
            }
        });

        _currentLocationIndex.Value += text.Length;
    }

    public TableBuilder StartTable()
    {
        return new TableBuilder(_currentLocationIndex, _requests);
    }

    public void AddPageBreak()
    {
        _requests.Add(new Request
        {
            InsertPageBreak = new InsertPageBreakRequest
            {
                Location = new Location
                {
                    Index = _currentLocationIndex.Value
                }
            }
        });
        
        _currentLocationIndex.Value++;
    }
    
    public IList<Request> GetBatchUpdateRequests()
    {
        return _requests;
    }
}