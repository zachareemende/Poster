#pragma warning disable CS8618
using System.ComponentModel.DataAnnotations;
namespace Server.Models;
public class LoginUser
{
    [Required(ErrorMessage = "Email Is Required")]
    [EmailAddress]
    [Display(Name = "Email")]
    public string LEmail { get; set; }

    [Required(ErrorMessage = "Password Is Required")]
    [DataType(DataType.Password)]
    [Display(Name = "Password")]
    public string LPassword { get; set; }
}
