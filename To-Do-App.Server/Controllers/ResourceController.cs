using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.Design;
using To_Do_App.Server.Data;
using To_Do_App.Server.Models;
using To_Do_App.Server.Services;
using To_Do_App.Server.Services.Interfaces;

namespace To_Do_App.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResourceController : ControllerBase
    {
        private readonly Services.Interfaces.IResourceService _resourceService;

        public ResourceController(Services.Interfaces.IResourceService resourceService)
        {
            _resourceService = resourceService;
        }

        [HttpGet(Name = "GetAllUserResources")]
        public async Task<ActionResult<IEnumerable<Resource>>> GetResources()
        {
            try
            {
                var resources = await _resourceService.GetResources();
                return Ok(resources);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        [HttpGet("{resourceId}", Name = "GetResourceById")]
        public async Task<ActionResult<Resource>> GetResource(Guid resourceId)
        {
            try
            {
                var resource = await _resourceService.GetResource(resourceId);
                if (resource == null)
                {
                    return NotFound("Nie znaleziono zasobu o podanym identyfikatorze!");
                }
                return Ok(resource);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        [HttpPost(Name = "AddResource")]
        public async Task<ActionResult<Resource>> AddResource([FromForm] FileUploadRequest file, [FromQuery] Guid taskId)
        {
            if (file == null || file.File.Length == 0)
            {
                return BadRequest("Brak pliku!");
            }

            try
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "Resources", "Files");

                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var filePath = Path.Combine(uploadsFolder, file.File.FileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.File.CopyToAsync(stream);
                }

                var resource = new Resource
                {
                    ResourceId = Guid.NewGuid(),
                    ResourceType = file.File.ContentType,
                    FileName = file.File.FileName,
                    FilePath = "/Resources/Files",
                    TaskId = taskId,
                    UploadDate = DateTime.UtcNow
                };

                var createdResource = await _resourceService.AddResource(resource);
                return CreatedAtRoute("GetResourceById", new { resourceId = createdResource.ResourceId }, createdResource);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        [HttpPatch("{resourceId}", Name = "UpdateResource")]
        public async Task<IActionResult> UpdateResource(Guid resourceId, [FromBody] JsonPatchDocument<Resource> pathDoc)
        {
            if (pathDoc == null)
            {
                return BadRequest("Nieprawidłowe dane zasobu!");
            }

            if(await _resourceService.GetResource(resourceId) == null)
            {
                return NotFound("Nie znaleziono zasobu o podanym identyfikatorze!");
            }

            try
            {
                await _resourceService.UpdateResource(resourceId, pathDoc);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        [HttpDelete("{resourceId}", Name = "DeleteResource")]
        public async Task<IActionResult> DeleteResource(Guid resourceId)
        {
            if (await _resourceService.GetResource(resourceId) == null)
            {
                return NotFound("Nie znaleziono zasobu o podanym identyfikatorze!");
            }

            try
            {
                await _resourceService.DeleteResource(resourceId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        [HttpGet("task/{taskId}", Name = "GetResourcesByTask")]
        public async Task<ActionResult<IEnumerable<Resource>>> GetResourcesByTask(Guid taskId)
        {
            try
            {
                var resources = await _resourceService.GetResourcesByTask(taskId);
                return Ok(resources);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        [HttpGet("type/{type}", Name = "GetResourcesByType")]
        public async Task<ActionResult<IEnumerable<Resource>>> GetResourcesByType(String type)
        {
            try
            {
                var resources = await _resourceService.GetResourcesByType(type);
                if (resources == null || !resources.Any())
                {
                    return NotFound("Brak zasobów o podanym typie!");
                }
                return Ok(resources);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }
    }
}
