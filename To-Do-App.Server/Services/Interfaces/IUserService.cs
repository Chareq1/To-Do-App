using Microsoft.AspNetCore.JsonPatch;
using To_Do_App.Server.Models;

namespace To_Do_App.Server.Services.Interfaces
{
    // Interfejs usługi dla użytkowników
    public interface IUserService
    {
        public Task<IEnumerable<User>> GetUsers();
        public Task<User> GetUser(Guid userId);
        public Task<User> AddUser(User user);
        public System.Threading.Tasks.Task UpdateUser(Guid userId, JsonPatchDocument<User> patchDoc);
        public System.Threading.Tasks.Task DeleteUser(Guid userId);
        public Task<User?> GetUserByUsername(string username);
        public Task<User?> GetUserByEmail(string email);
        public bool VerifyPassword(String hash, String password);
    }
}
