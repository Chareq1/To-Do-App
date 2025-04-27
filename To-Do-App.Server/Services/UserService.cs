using Microsoft.AspNetCore.JsonPatch;
using Microsoft.EntityFrameworkCore;
using System.Xml.Linq;
using To_Do_App.Server.Data;
using To_Do_App.Server.Models;
using To_Do_App.Server.Services.Interfaces;
using BCrypt.Net;
using System.Diagnostics;

namespace To_Do_App.Server.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<User>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<User?> GetUser(Guid userId)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        }

        public async Task<User> AddUser(User user)
        {
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            try
            {
                user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);

                var defaultAvatar = await _context.Avatars.FirstOrDefaultAsync(a => a.FileName == "default.png");

                user.AvatarId = defaultAvatar!.AvatarId;

                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync();
                return user;
            }
            catch (DbUpdateException ex)
            {
                throw new DbUpdateException("Nie można dodać użytkownika do bazy danych!", ex);
            }
        }

        public async System.Threading.Tasks.Task UpdateUser(Guid userId, JsonPatchDocument<User> patchDoc)
        {
            try
            {
                var existingUser = await _context.Users.FindAsync(userId);
                var currentPassword = existingUser?.Password;

                if (existingUser == null)
                {
                    throw new Exception("User not found.");
                }

                // Apply the patch document to the existing user
                patchDoc.ApplyTo(existingUser);

                // Check if the password has been updated
                var passwordOperation = patchDoc.Operations.FirstOrDefault(op => op.path == "/password");
                if (passwordOperation != null && passwordOperation.value != null)
                {
                    string newPassword = passwordOperation.value.ToString();
                    if (!string.IsNullOrEmpty(newPassword) &&
                        !BCrypt.Net.BCrypt.Verify(newPassword.ToString(), currentPassword.ToString()))
                    {
                        existingUser.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
                    }
                }

                _context.Users.Update(existingUser);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.WriteLine($"Error in UpdateUser: {ex.Message}");
                throw;
            }
        }

        public async System.Threading.Tasks.Task DeleteUser(Guid userId)
        {
            try
            {
                var user = await GetUser(userId);
                if (user != null)
                {
                    var userAvatar = await _context.Avatars.FirstOrDefaultAsync(a => a.AvatarId == user.AvatarId);
                    var defaultAvatar = await _context.Avatars.FirstOrDefaultAsync(a => a.FileName == "default.png");

                    if (userAvatar != null && userAvatar.AvatarId != defaultAvatar!.AvatarId)
                    {
                        var deletePath = Path.Combine(Directory.GetCurrentDirectory(), "Resources", "Avatars", userAvatar.FileName);
                        if (File.Exists(deletePath))
                        {
                            File.Delete(deletePath);
                        }
                        _context.Avatars.Remove(userAvatar);
                    }

                    _context.Users.Remove(user);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    throw new Exception("Nie znaleziono użytkownika o podanym identyfikatorze!");
                }
            }
            catch (DbUpdateException ex)
            {
                throw new DbUpdateException("Nie można usunąć użytkownika z bazy danych!", ex);
            }
        }

        public async Task<User?> GetUserByUsername(String username)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task<User?> GetUserByEmail(String email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetUserByUsernameAndPassword(String username, String password)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Username == username && u.Password == password);
        }

        public async Task<User?> GetUserByEmailAndPassword(String email, String password)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email && u.Password == password);
        }

        public bool VerifyPassword(String hash, String password)
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
    }
}
