using SaborDaVila.Api.Common;

namespace SaborDaVila.Api.Menu;

public class DuplicateMenuItemNameException : AppException
{
    public override int StatusCode => 409;
    public override string Code => "duplicate_name";

    public DuplicateMenuItemNameException() : base("a menu item with this name already exists") { }
}