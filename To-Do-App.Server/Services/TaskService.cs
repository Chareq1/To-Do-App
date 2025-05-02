using To_Do_App.Server.Data;
using To_Do_App.Server.Services.Interfaces;
using To_Do_App.Server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.JsonPatch;
using System.Threading.Tasks;

namespace To_Do_App.Server.Services
{
    public class TaskService : ITaskService
    {
        private readonly ApplicationDbContext _context;

        public TaskService(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<Models.Task>> GetTasks(Guid userId)
        {
            return await _context.Tasks.Where(t => t.UserId == userId).ToListAsync();
        }

        public async Task<Models.Task> GetTask(Guid taskId)
        {
            return await _context.Tasks.FirstOrDefaultAsync(t => t.TaskId == taskId);
        }

        public async Task<Models.Task> AddTask(Models.Task task)
        {
            if (task == null) 
            {
                throw new ArgumentNullException(nameof(task));
            }

            try
            {
                task.CreatedAt = DateTime.UtcNow;


                if (task.DueDate.HasValue)
                {
                    task.DueDate = DateTime.SpecifyKind(task.DueDate.Value, DateTimeKind.Local);
                }

                if (task.DoneDate.HasValue)
                {
                    task.DoneDate = DateTime.SpecifyKind(task.DoneDate.Value, DateTimeKind.Local);
                }

                _context.Tasks.Add(task);
                _context.SaveChanges();
                return task;
            }
            catch (DbUpdateException ex)
            {
                throw new DbUpdateException("Nie można dodać zadania do bazy danych!!", ex);
            }
        }

        public async System.Threading.Tasks.Task UpdateTask(Guid taskId, JsonPatchDocument<Models.Task> patchDoc)
        {
            if (patchDoc == null)
            {
                throw new ArgumentNullException(nameof(patchDoc));
            }

            try
            {
                var existingTask = await GetTask(taskId);

                if (existingTask == null)
                {
                    throw new Exception("Nie znaleziono zadania o podanym identyfikatorze!");
                }

                patchDoc.ApplyTo(existingTask);

                if (existingTask.DueDate.HasValue)
                {
                    existingTask.DueDate = DateTime.SpecifyKind(existingTask.DueDate.Value, DateTimeKind.Local);
                }

                if (existingTask.DoneDate.HasValue)
                {
                    existingTask.DoneDate = DateTime.SpecifyKind(existingTask.DoneDate.Value, DateTimeKind.Local);
                }

                _context.Tasks.Update(existingTask);
                _context.SaveChanges();
            }
            catch (DbUpdateException ex)
            {
                throw new DbUpdateException("Nie można zaktualizować zadania w bazie danych!", ex);
            }
        }

        public async System.Threading.Tasks.Task DeleteTask(Guid taskId)
        {
            try
            {
                var task = await GetTask(taskId);
                if (task == null)
                {
                    throw new Exception("Nie znaleziono zadania o podanym identyfikatorze!");
                }
                _context.Tasks.Remove(task);
                _context.SaveChanges();
            }
            catch (DbUpdateException ex)
            {
                throw new DbUpdateException("Nie można usunąć zadania z bazy danych!", ex);
            }
        }

        // GET
        public async Task<IEnumerable<Models.Task>> GetTasksByCategory(Guid userId, Guid categoryId)
        {
            return await _context.Tasks.Where(t => t.UserId == userId && t.CategoryId == categoryId).ToListAsync();
        }

        public async Task<IEnumerable<Models.Task>> GetTasksByPriority(Guid userId, int priority)
        {
            return await _context.Tasks.Where(t => t.UserId == userId && (int)t.Priority == priority).ToListAsync();
        }

        public async Task<IEnumerable<Models.Task>> GetTasksByStatus(Guid userId, int status)
        {
            return await _context.Tasks.Where(t => t.UserId == userId && (int)t.Status == status).ToListAsync();
        }

        public async Task<IEnumerable<Models.Task>> GetTasksByDueDate(Guid userId, DateTime dueDate)
        {
            return await _context.Tasks.Where(t => t.UserId == userId && t.DueDate == dueDate).ToListAsync();
        }

        public async Task<IEnumerable<Models.Task>> GetTasksByDueDateRange(Guid userId, DateTime startDate, DateTime endDate)
        {
            return await _context.Tasks.Where(t => t.UserId == userId && t.DueDate >= startDate && t.DueDate <= endDate).ToListAsync();
        }

        public async Task<IEnumerable<Models.Task>> GetTasksByName(Guid userId, string name)
        {
            return await _context.Tasks.Where(t => t.UserId == userId && t.Name == name).ToListAsync();
        }

        public async Task<IEnumerable<Models.Task>> GetTasksByCreatedDate(Guid userId, DateTime createdDate)
        {
            return await _context.Tasks.Where(t => t.UserId == userId && t.CreatedAt == createdDate).ToListAsync();
        }
    }
}
