using Microsoft.AspNetCore.Mvc;

namespace To_Do_App.Server.Data
{
    /// Model do przesyłania plików
    public class FileUploadRequest
    {
        [FromForm(Name = "file")]
        public IFormFile File { get; set; }
    }
}