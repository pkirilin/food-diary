using System.Net;

namespace FoodDiary.API.Mcp.Authorization.Cimd;

public interface ICimdAddressFilter
{
    bool IsAllowed(IPAddress address);
}