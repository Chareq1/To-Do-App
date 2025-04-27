using Microsoft.AspNetCore.Mvc;

namespace To_Do_App.Server.Data
{
    public class FileUploadRequest
    {
        [FromForm(Name = "file")]
        public IFormFile File { get; set; }
    }
}