namespace To_Do_App.Server.Models.Auth
{
    public class RegisterRequest
    {
        public string Username { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string Surname { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
    }
}
