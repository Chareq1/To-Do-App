using To_Do_App.Server.Data;
using To_Do_App.Server.Services.Interfaces;
using To_Do_App.Server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.JsonPatch;
using System.Threading.Tasks;

namespace To_Do_App.Server.Services
{
    // Klasa usługi dla zadań
    public class TaskService : ITaskService
    {
        // Deklaracja kontekstu bazy danych
        private readonly ApplicationDbContext _context;

        // Konstruktor
        public TaskService(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        // Metoda do pobierania wszystkich zadań dla danego użytkownika
        public async Task<IEnumerable<Models.Task>> GetTasks(Guid userId)
        {
            return await _context.Tasks.Where(t => t.UserId == userId).ToListAsync();
        }

        // Metoda do pobierania zadania po identyfikatorze
        public async Task<Models.Task> GetTask(Guid taskId)
        {
            return await _context.Tasks.FirstOrDefaultAsync(t => t.TaskId == taskId);
        }

        // Metoda do dodawania nowego zadania
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

        // Metoda do aktualizacji zadania
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

        // Metoda do usuwania zadania
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
    }
}
