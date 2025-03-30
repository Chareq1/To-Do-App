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
    }
}
