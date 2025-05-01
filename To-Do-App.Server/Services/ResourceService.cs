using Microsoft.AspNetCore.JsonPatch;
using Microsoft.EntityFrameworkCore;
using To_Do_App.Server.Data;
using To_Do_App.Server.Models;
using To_Do_App.Server.Services.Interfaces;

namespace To_Do_App.Server.Services
{
    public class ResourceService : IResourceService
    {
        private readonly ApplicationDbContext _context;

        public ResourceService(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<Resource>> GetResources()
        {
            return await _context.Resources.ToListAsync();
        }

        public async Task<Resource?> GetResource(Guid resourceId)
        {
            return await _context.Resources.FirstOrDefaultAsync(r => r.ResourceId == resourceId);
        }

        public async Task<Resource> AddResource(Resource resource)
        {
            if (resource == null)
            {
                throw new ArgumentNullException(nameof(resource));
            }

            try
            {
                await _context.Resources.AddAsync(resource);
                await _context.SaveChangesAsync();
                return resource;
            }
            catch (DbUpdateException ex)
            {
                throw new DbUpdateException("Nie można dodać załącznika do bazy danych!", ex);
            }
        }

        public async System.Threading.Tasks.Task UpdateResource(Guid resourceId, JsonPatchDocument<Resource> patchDoc)
        {
            if (patchDoc == null)
            {
                throw new ArgumentNullException(nameof(patchDoc));
            }

            try
            {
                var existingResource = await GetResource(resourceId);

                if (existingResource == null)
                {
                    throw new Exception("Nie znaleziono załącznika o podanym identyfikatorze!");
                }

                patchDoc.ApplyTo(existingResource);

                _context.Resources.Update(existingResource);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new DbUpdateException("Nie można zaktualizować załącznika w bazie danych!", ex);
            }
        }

        public async System.Threading.Tasks.Task DeleteResource(Guid resourceId)
        {
            try
            {
                var resource = await GetResource(resourceId);

                if (resource != null)
                {
                    var deletePath = Path.Combine(Directory.GetCurrentDirectory(), "Resources", "Files", resource.FileName);

                    if (File.Exists(deletePath))
                    {
                        File.Delete(deletePath);
                    }

                    _context.Resources.Remove(resource);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    throw new Exception("Nie znaleziono załącznika o podanym identyfikatorze!");
                }
            }
            catch (DbUpdateException ex)
            {
                throw new DbUpdateException("Nie można usunąć załącznika z bazy danych!", ex);
            }
        }


        //GET
        public async Task<IEnumerable<Resource>> GetResourcesByTask(Guid taskId)
        {
            return await _context.Resources.Where(r => r.TaskId == taskId).ToListAsync();
        }

        public async Task<IEnumerable<Resource>> GetResourcesByType(String type)
        {
            return await _context.Resources.Where(r => r.ResourceType == type).ToListAsync();
        }
    }
}
