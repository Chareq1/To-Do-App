using Microsoft.AspNetCore.JsonPatch;
using Microsoft.EntityFrameworkCore;
using System.Xml.Linq;
using To_Do_App.Server.Data;
using To_Do_App.Server.Models;
using To_Do_App.Server.Services.Interfaces;
using BCrypt.Net;

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
            if (patchDoc == null)
            {
                throw new ArgumentNullException(nameof(patchDoc));
            }

            try
            {
                var existingUser = await GetUser(userId);

                if (existingUser == null)
                {
                    throw new Exception("Nie znaleziono użytkownika o podanym identyfikatorze!");
                }

                patchDoc.ApplyTo(existingUser);

                _context.Users.Update(existingUser);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new DbUpdateException("Nie można zaktualizować użytkownika w bazie danych!", ex);
            }
        }

        public async System.Threading.Tasks.Task DeleteUser(Guid userId)
        {
            try
            {
                var user = await GetUser(userId);
                if (user != null)
                {
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
