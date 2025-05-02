namespace To_Do_App.Server.Models.Auth
{
    /// Klasa do obsługi żądania logowania
    public class LoginRequest
    {
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
    }
}
