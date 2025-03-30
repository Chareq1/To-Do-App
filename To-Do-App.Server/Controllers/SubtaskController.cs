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
    public class SubtaskController : ControllerBase
    {
        private readonly ISubtaskService _subtaskService;

        public SubtaskController(ISubtaskService subtaskService)
        {
            _subtaskService = subtaskService;
        }

        [HttpGet("task/{taskId}", Name = "GetAllTaskSubtasks")]
        public async Task<ActionResult<IEnumerable<Models.Subtask>>> GetSubtasks(Guid taskId)
        {
            try
            {
                var subtasks = await _subtaskService.GetSubtasks(taskId);
                if (subtasks == null || !subtasks.Any())
                {
                    return NotFound("Brak podzadań w bazie danych!");
                }
                return Ok(subtasks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        [HttpGet("{subtaskId}", Name = "GetSubtaskById")]
        public async Task<ActionResult<Models.Subtask>> GetSubtask(Guid subtaskId)
        {
            try
            {
                var subtask = await _subtaskService.GetSubtask(subtaskId);
                if (subtask == null)
                {
                    return NotFound("Nie znaleziono podzadania o podanym identyfikatorze!");
                }
                return Ok(subtask);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        [HttpPost(Name = "AddSubtask")]
        public async Task<ActionResult<Models.Subtask>> AddSubtask([FromBody] Models.Subtask subtask)
        {
            if (subtask == null)
            {
                return BadRequest("Nieprawidłowe dane podzadania!");
            }

            try
            {
                var newSubtask = await _subtaskService.AddSubtask(subtask);
                return CreatedAtRoute("GetSubtaskById", new { subtaskId = newSubtask.SubtaskId }, newSubtask);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        [HttpPatch("{subtaskId}", Name = "UpdateSubtask")]
        public async Task<IActionResult> UpdateSubtask(Guid subtaskId, [FromBody] JsonPatchDocument<Models.Subtask> patchDoc)
        {
            if (patchDoc == null)
            {
                return BadRequest("Nieprawidłowe dane wejściowe!");
            }

            if (await _subtaskService.GetSubtask(subtaskId) == null)
            {
                return NotFound("Nie znaleziono podzadania o podanym identyfikatorze!");
            }

            try
            {
                await _subtaskService.UpdateSubtask(subtaskId, patchDoc);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        [HttpDelete("{subtaskId}", Name = "DeleteSubtask")]
        public async Task<IActionResult> DeleteSubtask(Guid subtaskId)
        {
            if(await _subtaskService.GetSubtask(subtaskId) == null)
            {
                return NotFound("Nie znaleziono podzadania o podanym identyfikatorze!");
            }

            try
            {
                await _subtaskService.DeleteSubtask(subtaskId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
    }
}
