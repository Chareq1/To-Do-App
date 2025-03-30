using Microsoft.AspNetCore.JsonPatch;

namespace To_Do_App.Server.Services.Interfaces
{
    public interface ISubtaskService
    {
        public Task<IEnumerable<Models.Subtask>> GetSubtasks(Guid taskId);
        public Task<Models.Subtask> GetSubtask(Guid subtaskId);
        public Task<Models.Subtask> AddSubtask(Models.Subtask subtask);
        public System.Threading.Tasks.Task UpdateSubtask(Guid subtaskId, JsonPatchDocument<Models.Subtask> patchDoc);
        public System.Threading.Tasks.Task DeleteSubtask(Guid subtaskId);
    }
}
