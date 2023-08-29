using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Server.Models;
// for passwords (session stuff)
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Filters;
// for include
using Microsoft.EntityFrameworkCore;

namespace Server.Controllers
{
    [Route("api/poster")]
    [ApiController]
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        private MyContext _context;

        public HomeController(ILogger<HomeController> logger, MyContext context)
        {
            _logger = logger;
            _context = context;
        }

        [HttpGet("")]
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost("users/create")]
        public IActionResult CreateUser(User newUser)
        {
            if (ModelState.IsValid)
            {
                PasswordHasher<User> Hasher = new PasswordHasher<User>();
                newUser.Password = Hasher.HashPassword(newUser, newUser.Password);

                _context.Add(newUser);
                _context.SaveChanges();

                HttpContext.Session.SetInt32("UserId", newUser.UserId);
                return RedirectToAction("Dashboard");
            }
            else
            {
                return View("Index");
            }
        }

        [HttpPost("users/login")]
        public IActionResult UserLogin(LoginUser LogUser)
        {
            if (ModelState.IsValid)
            {
                User? userInDb = _context.Users.FirstOrDefault(u => u.Email == LogUser.LEmail);

                if (userInDb == null)
                {
                    ModelState.AddModelError("LEmail", "Invalid Email/Password");
                    return View("Index");
                }
                PasswordHasher<LoginUser> hasher = new PasswordHasher<LoginUser>();
                var result = hasher.VerifyHashedPassword(LogUser, userInDb.Password, LogUser.LPassword);
                if (result == 0)
                {
                    ModelState.AddModelError("LEmail", "Invalid Email/Password");
                    return View("Index");
                }
                else
                {
                    HttpContext.Session.SetInt32("UserId", userInDb.UserId);
                    return RedirectToAction("Dashboard");
                }
            }
            else
            {
                return View("Index");
            }
        }

        [SessionCheck]
        [HttpGet("dashboard")]
        public IActionResult Dashboard()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        public class SessionCheckAttribute : ActionFilterAttribute
        {
            public override void OnActionExecuting(ActionExecutingContext context)
            {
                int? userId = context.HttpContext.Session.GetInt32("UserId");
                if (userId == null)
                {
                    context.Result = new RedirectToActionResult("Index", "Home", null);
                }
            }
        }
    }
}

