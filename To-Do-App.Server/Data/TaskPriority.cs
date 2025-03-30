namespace To_Do_App.Server.Data
{
    public enum TaskPriority
    {
        [System.ComponentModel.DataAnnotations.Display(Name = "Niski")]
        Niski,
        [System.ComponentModel.DataAnnotations.Display(Name = "Średni")]
        Średni,
        [System.ComponentModel.DataAnnotations.Display(Name = "Wysoki")]
        Wysoki
    }
}
