using Microsoft.AspNetCore.JsonPatch;
using Microsoft.EntityFrameworkCore;
using To_Do_App.Server.Data;
using To_Do_App.Server.Services.Interfaces;

namespace To_Do_App.Server.Services
{
    public class SubtaskService : ISubtaskService
    {
        private readonly ApplicationDbContext _context;

        public SubtaskService(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<Models.Subtask>> GetSubtasks(Guid taskId)
        {
            return await _context.Subtasks.Where(s => s.TaskId == taskId).ToListAsync();    
        }

        public async Task<Models.Subtask> GetSubtask(Guid subtaskId)
        {
            return await _context.Subtasks.FirstOrDefaultAsync(s => s.SubtaskId == subtaskId);
        }

        public async Task<Models.Subtask> AddSubtask(Models.Subtask subtask)
        {
            if (subtask == null)
            {
                throw new ArgumentNullException(nameof(subtask));
            }

            try
            {
                await _context.Subtasks.AddAsync(subtask);
                await _context.SaveChangesAsync();
                return subtask;
            }
            catch (DbUpdateException ex)
            {
                throw new DbUpdateException("Nie można dodać podzadania do bazy danych!", ex);
            }
        }

        public async System.Threading.Tasks.Task UpdateSubtask(Guid subtaskId, JsonPatchDocument<Models.Subtask> patchDoc)
        {
            if (patchDoc == null)
            {
                throw new ArgumentNullException(nameof(patchDoc));
            }

            try
            {
                var existingSubtask = await GetSubtask(subtaskId);

                if (existingSubtask == null)
                {
                    throw new Exception("Nie znaleziono podzadania o podanym identyfikatorze!");
                }

                patchDoc.ApplyTo(existingSubtask);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new DbUpdateException("Nie można zaktualizować podzadania w bazie danych!", ex);
            }
        }

        public async System.Threading.Tasks.Task DeleteSubtask(Guid subtaskId)
        {
            try
            {
                var subtask = await GetSubtask(subtaskId);
                if (subtask == null)
                {
                    throw new Exception("Nie znaleziono podzadania o podanym identyfikatorze!");
                }

                _context.Subtasks.Remove(subtask);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new DbUpdateException("Nie można usunąć podzadania z bazy danych!", ex);
            }
        }
    }
}
