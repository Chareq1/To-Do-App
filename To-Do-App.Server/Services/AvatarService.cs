using Microsoft.AspNetCore.JsonPatch;
using Microsoft.EntityFrameworkCore;
using To_Do_App.Server.Data;
using To_Do_App.Server.Models;
using To_Do_App.Server.Services.Interfaces;

namespace To_Do_App.Server.Services
{
    public class AvatarService : IAvatarService
    {
        private readonly ApplicationDbContext _context;

        public AvatarService(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<Avatar>> GetAvatars()
        {
            return await _context.Avatars.ToListAsync();
        }

        public async Task<Avatar?> GetAvatar(Guid avatarId)
        {
            return await _context.Avatars.FirstOrDefaultAsync(a => a.AvatarId == avatarId);
        }

        public async Task<Avatar> AddAvatar(Avatar avatar)
        {
            if(avatar == null)
            {
                throw new ArgumentNullException(nameof(avatar));
            }

            try
            {
                await _context.Avatars.AddAsync(avatar);
                await _context.SaveChangesAsync();

                return avatar;
            }
            catch (DbUpdateException ex)
            {
                throw new DbUpdateException("Nie można dodać awatara do bazy danych!", ex);
            }
        }

        public async System.Threading.Tasks.Task UpdateAvatar(Guid avatarId, JsonPatchDocument<Avatar> patchDoc)
        {
            if (patchDoc == null)
            {
                throw new ArgumentNullException(nameof(patchDoc));
            }

            try
            {
                var existingAvatar = await GetAvatar(avatarId);

                if (existingAvatar == null)
                {
                    throw new Exception("Nie znaleziono awatara o podanym identyfikatorze!");
                }

                patchDoc.ApplyTo(existingAvatar);

                _context.Avatars.Update(existingAvatar);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new DbUpdateException("Nie można zaktualizować awatara w bazie danych!", ex);
            }
        }

        public async System.Threading.Tasks.Task DeleteAvatar(Guid avatarId)
        {
            try
            {
                var avatar = await GetAvatar(avatarId);
                if (avatar != null)
                {
                    var deletePath = Path.Combine(Directory.GetCurrentDirectory(), "Resources", "Avatars", avatar?.FileName);

                    if (File.Exists(deletePath))
                    {
                        File.Delete(deletePath);
                    }

                    _context.Avatars.Remove(avatar);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    throw new Exception("Nie znaleziono awatara o podanym identyfikatorze!");
                }
            }
            catch (DbUpdateException ex)
            {
                throw new DbUpdateException("Nie można usunąć awatara z bazy danych!", ex);
            }
        }

        public async Task<Avatar?> GetDefaultAvatar()
        {
            return await _context.Avatars.FirstOrDefaultAsync(a => a.FileName == "default.png");
        }
    }
}
