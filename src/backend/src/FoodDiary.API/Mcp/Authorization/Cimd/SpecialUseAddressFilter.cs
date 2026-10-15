using System.Net;
using System.Net.Sockets;

namespace FoodDiary.API.Mcp.Authorization.Cimd;

public interface ICimdAddressFilter
{
    bool IsAllowed(IPAddress address);
}

public sealed class SpecialUseAddressFilter : ICimdAddressFilter
{
    // Covers ::, ::1, IPv4-compatible ::/96, NAT64, ULA, link-local, site-local and multicast
    private static readonly IPNetwork GlobalUnicastIPv6 = IPNetwork.Parse("2000::/3");

    // IANA IPv4 and IPv6 special-purpose address registries (RFC 6890), plus IPv4 multicast
    private static readonly IPNetwork[] SpecialUseNetworks =
    [
        IPNetwork.Parse("0.0.0.0/8"),
        IPNetwork.Parse("10.0.0.0/8"),
        IPNetwork.Parse("100.64.0.0/10"),
        IPNetwork.Parse("127.0.0.0/8"),
        IPNetwork.Parse("169.254.0.0/16"),
        IPNetwork.Parse("172.16.0.0/12"),
        IPNetwork.Parse("192.0.0.0/24"),
        IPNetwork.Parse("192.0.2.0/24"),
        IPNetwork.Parse("192.31.196.0/24"),
        IPNetwork.Parse("192.52.193.0/24"),
        IPNetwork.Parse("192.88.99.0/24"),
        IPNetwork.Parse("192.168.0.0/16"),
        IPNetwork.Parse("192.175.48.0/24"),
        IPNetwork.Parse("198.18.0.0/15"),
        IPNetwork.Parse("198.51.100.0/24"),
        IPNetwork.Parse("203.0.113.0/24"),
        IPNetwork.Parse("224.0.0.0/4"),
        IPNetwork.Parse("240.0.0.0/4"),
        IPNetwork.Parse("2001::/23"),
        IPNetwork.Parse("2001:db8::/32"),
        IPNetwork.Parse("2002::/16"),
        IPNetwork.Parse("2620:4f:8000::/48"),
        IPNetwork.Parse("3fff::/20")
    ];

    public bool IsAllowed(IPAddress address)
    {
        if (address.IsIPv4MappedToIPv6)
        {
            address = address.MapToIPv4();
        }

        if (address.AddressFamily == AddressFamily.InterNetworkV6 && !GlobalUnicastIPv6.Contains(address))
        {
            return false;
        }

        return !SpecialUseNetworks.Any(network => network.Contains(address));
    }
}
