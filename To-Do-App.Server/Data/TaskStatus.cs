namespace To_Do_App.Server.Data
{
    public enum TaskStatus
    {
        [System.ComponentModel.DataAnnotations.Display(Name = "Do zrobienia")]
        ToDo,
        [System.ComponentModel.DataAnnotations.Display(Name = "W trackie realizacji")]
        InProgress,
        [System.ComponentModel.DataAnnotations.Display(Name = "Ukończone")]
        Completed
    }
}
