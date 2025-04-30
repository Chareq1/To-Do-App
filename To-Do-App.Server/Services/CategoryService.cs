using Microsoft.AspNetCore.JsonPatch;
using Microsoft.EntityFrameworkCore;
using To_Do_App.Server.Data;
using To_Do_App.Server.Models;
using To_Do_App.Server.Services.Interfaces;

namespace To_Do_App.Server.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ApplicationDbContext _context;

        public CategoryService(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context)); ;
        }

        public async Task<IEnumerable<Category>> GetCategories(Guid userId)
        {
            return await _context.Categories.Where(c => c.UserId == userId).ToListAsync();
        }

        public async Task<Category?> GetCategory(Guid categoryId)
        {
            return await _context.Categories.FirstOrDefaultAsync(c => c.CategoryId == categoryId);
        }

        public async Task<Category> AddCategory(Category category)
        {
            if (category == null)
            {
                throw new ArgumentNullException(nameof(category));
            }

            try { 
                _context.Categories.Add(category);
                _context.SaveChanges();
                return category;
            }
            catch (DbUpdateException ex)
            {
                throw new DbUpdateException("Nie można dodać kategorii do bazy danych!", ex);
            }
        }

        public async System.Threading.Tasks.Task UpdateCategory(Guid categoryId, JsonPatchDocument<Category> patchDoc)
        {
            if (patchDoc == null)
            {
                throw new ArgumentNullException(nameof(patchDoc));
            }

            try
            {
                var existingCategory = await GetCategory(categoryId);

                if (existingCategory == null)
                {
                    throw new Exception("Nie znaleziono kategorii o podanym identyfikatorze!");
                }

                patchDoc.ApplyTo(existingCategory);

                _context.Categories.Update(existingCategory);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new DbUpdateException("Nie można zaktualizować kategorii w bazie danych!", ex);
            }
        }

        public async System.Threading.Tasks.Task DeleteCategory(Guid categoryId) {
            try
            {
                var category = await GetCategory(categoryId);
                if (category != null)
                {
                    var tasksToDelete = await _context.Tasks.Where(t => t.CategoryId == categoryId).ToListAsync();
                    _context.Tasks.RemoveRange(tasksToDelete);

                    _context.Categories.Remove(category);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    throw new Exception("Nie znaleziono kategorii o podanym identyfikatorze!");
                }
            }
            catch (DbUpdateException ex)
            {
                throw new DbUpdateException("Nie można usunąć kategorii z bazy danych!", ex);
            }
        }


        //GET
        public async Task<IEnumerable<Category>> GetCategoriesByName(Guid userId, string name)
        {
            return await _context.Categories.Where(c => c.UserId == userId && c.Name == name).ToListAsync();
        }
    }
}
