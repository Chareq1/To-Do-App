using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using To_Do_App.Server.Models;
using To_Do_App.Server.Services;
using To_Do_App.Server.Services.Interfaces;

namespace To_Do_App.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // Kontroler do obsługi kategorii
    public class CategoryController : ControllerBase
    {
        // Usługi
        private readonly ICategoryService _categoryService;

        // Konstruktor
        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        // Metoda do uzyskiwania wszystkich kategorii użytkownika z mapowaniem i metodą HTTP
        [HttpGet("user/{userId}", Name = "GetAllUserCategories")]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories(Guid userId)
        {
            try
            {
                var categories = await _categoryService.GetCategories(userId);
                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        // Metoda do uzyskiwania kategorii po ID z mapowaniem i metodą HTTP
        [HttpGet("{categoryId}", Name = "GetCategoryById")]
        public async Task<ActionResult<Category>> GetCategory(Guid categoryId)
        {
            try
            {
                var category = await _categoryService.GetCategory(categoryId);
                if (category == null)
                {
                    return NotFound("Nie znaleziono kategorii o podanym identyfikatorze!");
                }
                return Ok(category);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        // Metoda do dodawania kategorii z mapowaniem i metodą HTTP
        [HttpPost(Name = "AddCategory")]
        public async Task<ActionResult<Category>> AddCategory([FromBody] Category category)
        {
            if (category == null)
            {
                return BadRequest("Nieprawidłowe dane wejściowe!");
            }

            try
            {
                var createdCategory = await _categoryService.AddCategory(category);
                return CreatedAtRoute("GetCategoryById", new { categoryId = createdCategory.CategoryId }, createdCategory);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        // Metoda do aktualizacji kategorii z mapowaniem i metodą HTTP
        [HttpPatch("{categoryId}", Name = "UpdateCategory")]
        public async Task<IActionResult> UpdateCategory(Guid categoryId, [FromBody] JsonPatchDocument<Category> patchDoc)
        {
            if (patchDoc == null)
            {
                return BadRequest("Nieprawidłowe dane wejściowe!");
            }

            if (await _categoryService.GetCategory(categoryId) == null)
            {
                return NotFound("Nie znaleziono kategorii o podanym identyfikatorze!");
            }

            try
            {
                await _categoryService.UpdateCategory(categoryId, patchDoc);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        // Metoda do usuwania kategorii z mapowaniem i metodą HTTP
        [HttpDelete("{categoryId}", Name = "DeleteCategory")]
        public async Task<IActionResult> DeleteCategory(Guid categoryId)
        {
            if (await _categoryService.GetCategory(categoryId) == null)
            {
                return NotFound("Nie znaleziono kategorii o podanym identyfikatorze!");
            }

            try
            {
                await _categoryService.DeleteCategory(categoryId);
                return NoContent();
            }
            catch (Exception ex)
            {
                throw new Exception($"Wystąpił błąd podczas usuwania kategorii: {ex.Message}");
            }
        }
    }
}
