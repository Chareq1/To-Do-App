using Microsoft.AspNetCore.JsonPatch;
using To_Do_App.Server.Models;

namespace To_Do_App.Server.Services.Interfaces
{
    public interface IResourceService
    {
        public Task<IEnumerable<Resource>> GetResources();
        public Task<Resource> GetResource(Guid resourceId);
        public Task<Resource> AddResource(Resource resource);
        public System.Threading.Tasks.Task UpdateResource(Guid resourceId, JsonPatchDocument<Resource> patchDoc);
        public System.Threading.Tasks.Task DeleteResource(Guid resourceId);

        public Task<IEnumerable<Resource>> GetResourcesByTask(Guid taskId);
        public Task<IEnumerable<Resource>> GetResourcesBySubtask(Guid subtaskId);
        public Task<IEnumerable<Resource>> GetResourcesByType(String type);
    }
}
