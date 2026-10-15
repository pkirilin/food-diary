using System.Net;
using FoodDiary.API.Mcp.Authorization.Cimd;

namespace FoodDiary.UnitTests.Mcp;

public class SpecialUseAddressFilterTests
{
    private static readonly SpecialUseAddressFilter Filter = new();

    [Theory]
    [InlineData("0.0.0.0")]
    [InlineData("0.1.2.3")]
    [InlineData("10.0.0.1")]
    [InlineData("10.255.255.255")]
    [InlineData("100.64.0.1")]
    [InlineData("100.127.255.255")]
    [InlineData("127.0.0.1")]
    [InlineData("127.255.255.254")]
    [InlineData("169.254.169.254")]
    [InlineData("172.16.0.1")]
    [InlineData("172.31.255.255")]
    [InlineData("192.0.0.1")]
    [InlineData("192.0.0.170")]
    [InlineData("192.0.2.1")]
    [InlineData("192.31.196.1")]
    [InlineData("192.52.193.1")]
    [InlineData("192.88.99.1")]
    [InlineData("192.168.1.1")]
    [InlineData("192.175.48.1")]
    [InlineData("198.18.0.1")]
    [InlineData("198.19.255.255")]
    [InlineData("198.51.100.1")]
    [InlineData("203.0.113.1")]
    [InlineData("224.0.0.1")]
    [InlineData("239.255.255.250")]
    [InlineData("240.0.0.1")]
    [InlineData("255.255.255.255")]
    public void SpecialUseIPv4Address_IsRefused(string address)
    {
        Filter.IsAllowed(IPAddress.Parse(address)).Should().BeFalse();
    }

    [Theory]
    [InlineData("::ffff:0.0.0.0")]
    [InlineData("::ffff:10.0.0.1")]
    [InlineData("::ffff:100.64.0.1")]
    [InlineData("::ffff:127.0.0.1")]
    [InlineData("::ffff:169.254.169.254")]
    [InlineData("::ffff:172.16.0.1")]
    [InlineData("::ffff:192.168.1.1")]
    [InlineData("::ffff:198.18.0.1")]
    [InlineData("::ffff:203.0.113.1")]
    [InlineData("::ffff:224.0.0.1")]
    [InlineData("::ffff:255.255.255.255")]
    public void IPv4MappedSpecialUseAddress_IsRefused(string address)
    {
        Filter.IsAllowed(IPAddress.Parse(address)).Should().BeFalse();
    }

    [Theory]
    [InlineData("::")]
    [InlineData("::1")]
    [InlineData("::127.0.0.1")]
    [InlineData("::8.8.8.8")]
    [InlineData("64:ff9b::7f00:1")]
    [InlineData("64:ff9b::808:808")]
    [InlineData("64:ff9b:1::1")]
    [InlineData("100::1")]
    [InlineData("100:0:0:1::1")]
    [InlineData("2001::1")]
    [InlineData("2001:2::1")]
    [InlineData("2001:10::1")]
    [InlineData("2001:1ff:ffff::1")]
    [InlineData("2001:db8::1")]
    [InlineData("2002:7f00:1::1")]
    [InlineData("2002:808:808::1")]
    [InlineData("2620:4f:8000::1")]
    [InlineData("3fff::1")]
    [InlineData("5f00::1")]
    [InlineData("fc00::1")]
    [InlineData("fd00:ec2::254")]
    [InlineData("fe80::1")]
    [InlineData("fe80::1%1")]
    [InlineData("fec0::1")]
    [InlineData("ff02::1")]
    [InlineData("ff0e::1")]
    public void SpecialUseIPv6Address_IsRefused(string address)
    {
        Filter.IsAllowed(IPAddress.Parse(address)).Should().BeFalse();
    }

    [Theory]
    [InlineData("1.1.1.1")]
    [InlineData("8.8.8.8")]
    [InlineData("9.255.255.255")]
    [InlineData("11.0.0.0")]
    [InlineData("100.63.255.255")]
    [InlineData("100.128.0.0")]
    [InlineData("128.0.0.1")]
    [InlineData("172.15.255.255")]
    [InlineData("172.32.0.0")]
    [InlineData("192.169.0.1")]
    [InlineData("198.17.255.255")]
    [InlineData("198.20.0.0")]
    [InlineData("223.255.255.255")]
    [InlineData("::ffff:8.8.8.8")]
    [InlineData("2001:200::1")]
    [InlineData("2001:4860:4860::8888")]
    [InlineData("2606:4700:4700::1111")]
    [InlineData("2a00:1450:4001::1")]
    public void GlobalUnicastAddress_IsAllowed(string address)
    {
        Filter.IsAllowed(IPAddress.Parse(address)).Should().BeTrue();
    }
}
