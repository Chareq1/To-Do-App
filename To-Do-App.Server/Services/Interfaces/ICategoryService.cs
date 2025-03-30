using Microsoft.AspNetCore.JsonPatch;
using To_Do_App.Server.Models;

namespace To_Do_App.Server.Services.Interfaces
{
    public interface ICategoryService
    {
        public Task<IEnumerable<Category>> GetCategories(Guid userId);
        public Task<Category> GetCategory(Guid categoryId);
        public Task<Category> AddCategory(Category category);
        public System.Threading.Tasks.Task UpdateCategory(Guid categoryId, JsonPatchDocument<Category> patchDoc);
        public System.Threading.Tasks.Task DeleteCategory(Guid categoryId);

        public Task<IEnumerable<Category>> GetCategoriesByName(Guid userId, string name);
    }
}
