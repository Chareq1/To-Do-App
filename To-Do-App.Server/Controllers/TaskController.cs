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
    public class TaskController : ControllerBase
    {
        public readonly ITaskService _taskService;

        public TaskController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        [HttpGet("user/{userId}", Name = "GetAllUserTasks")]
        public async Task<ActionResult<IEnumerable<Models.Task>>> GetTasks(Guid userId)
        {
            try
            {
                var tasks = await _taskService.GetTasks(userId);
                if (tasks == null || !tasks.Any())
                {
                    return NotFound("Brak zadań w bazie danych!");
                }
                return Ok(tasks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        [HttpGet("{taskId}", Name = "GetTaskById")]
        public async Task<ActionResult<Models.Task>> GetTask(Guid taskId)
        {
            try
            {
                var task = await _taskService.GetTask(taskId);
                if (task == null)
                {
                    return NotFound("Nie znaleziono zadania o podanym identyfikatorze!");
                }
                return Ok(task);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        [HttpPost(Name = "AddTask")]
        public async Task<ActionResult<Models.Task>> AddTask([FromBody] Models.Task task)
        {
            if (task == null)
            {
                return BadRequest("Nieprawidłowe dane wejściowe!");
            }

            try
            {
                var addedTask = await _taskService.AddTask(task);
                return CreatedAtRoute("GetTaskById", new { taskId = addedTask.TaskId }, addedTask);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        [HttpPatch("{taskId}", Name = "UpdateTask")]
        public async Task<IActionResult> UpdateTask(Guid taskId, [FromBody] JsonPatchDocument<Models.Task> patchDoc)
        {
            if (patchDoc == null)
            {
                return BadRequest("Nieprawidłowe dane wejściowe!");
            }

            if (await _taskService.GetTask(taskId) == null)
            {
                return NotFound("Nie znaleziono zadania o podanym identyfikatorze!");
            }

            try
            {
                await _taskService.UpdateTask(taskId, patchDoc);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }

        [HttpDelete("{taskId}", Name = "DeleteTask")]
        public async Task<IActionResult> DeleteTask(Guid taskId)
        {
            if (await _taskService.GetTask(taskId) == null)
            {
                return NotFound("Nie znaleziono zadania o podanym identyfikatorze!");
            }

            try
            {
                await _taskService.DeleteTask(taskId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Wystąpił błąd serwera: {ex.Message}");
            }
        }
    }
}
