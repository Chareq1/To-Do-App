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


        // GET
        [HttpGet("category/{userId}/{categoryId}", Name = "GetTasksByCategory")]
        public async Task<ActionResult<IEnumerable<Models.Task>>> GetTasksByCategory(Guid userId, Guid categoryId)
        {
            try
            {
                var tasks = await _taskService.GetTasksByCategory(userId, categoryId);
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

        [HttpGet("priority/{userId}/{priority}", Name = "GetTasksByPriority")]
        public async Task<ActionResult<IEnumerable<Models.Task>>> GetTasksByPriority(Guid userId, int priority)
        {
            try
            {
                var tasks = await _taskService.GetTasksByPriority(userId, priority);
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

        [HttpGet("status/{userId}/{status}", Name = "GetTasksByStatus")]
        public async Task<ActionResult<IEnumerable<Models.Task>>> GetTasksByStatus(Guid userId, int status)
        {
            try
            {
                var tasks = await _taskService.GetTasksByStatus(userId, status);
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

        [HttpGet("dueDate/{userId}/{dueDate}", Name = "GetTasksByDueDate")]
        public async Task<ActionResult<IEnumerable<Models.Task>>> GetTasksByDueDate(Guid userId, DateTime dueDate)
        {
            try
            {
                var tasks = await _taskService.GetTasksByDueDate(userId, dueDate);
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

        [HttpGet("dueDateRange/{userId}/{startDate}/{endDate}", Name = "GetTasksByDueDateRange")]
        public async Task<ActionResult<IEnumerable<Models.Task>>> GetTasksByDueDateRange(Guid userId, DateTime startDate, DateTime endDate)
        {
            try
            {
                var tasks = await _taskService.GetTasksByDueDateRange(userId, startDate, endDate);
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

        [HttpGet("name/{userId}/{name}", Name = "GetTasksByName")]
        public async Task<ActionResult<IEnumerable<Models.Task>>> GetTasksByName(Guid userId, string name)
        {
            try
            {
                var tasks = await _taskService.GetTasksByName(userId, name);
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

        [HttpGet("createdDate/{userId}/{createdDate}", Name = "GetTasksByCreatedDate")]
        public async Task<ActionResult<IEnumerable<Models.Task>>> GetTasksByCreatedDate(Guid userId, DateTime createdDate)
        {
            try
            {
                var tasks = await _taskService.GetTasksByCreatedDate(userId, createdDate);
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
    }
}
