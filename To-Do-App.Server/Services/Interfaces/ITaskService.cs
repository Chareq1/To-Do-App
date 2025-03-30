using Microsoft.AspNetCore.JsonPatch;

namespace To_Do_App.Server.Services.Interfaces
{
    public interface ITaskService
    {
        public Task<IEnumerable<Models.Task>> GetTasks(Guid userId);
        public Task<Models.Task> GetTask(Guid taskId);
        public Task<Models.Task> AddTask(Models.Task task);
        public System.Threading.Tasks.Task UpdateTask(Guid taskId, JsonPatchDocument<Models.Task> patchDoc);
        public System.Threading.Tasks.Task DeleteTask(Guid taskId);

        public Task<IEnumerable<Models.Task>> GetTasksByCategory(Guid userId, Guid categoryId);
        public Task<IEnumerable<Models.Task>> GetTasksByPriority(Guid userId, int priority);
        public Task<IEnumerable<Models.Task>> GetTasksByStatus(Guid userId, int status);
        public Task<IEnumerable<Models.Task>> GetTasksByDueDate(Guid userId, DateTime dueDate);
        public Task<IEnumerable<Models.Task>> GetTasksByDueDateRange(Guid userId, DateTime startDate, DateTime endDate);
        public Task<IEnumerable<Models.Task>> GetTasksByName(Guid userId, string name);
        public Task<IEnumerable<Models.Task>> GetTasksByCreatedDate(Guid userId, DateTime createdDate);
    }
}
