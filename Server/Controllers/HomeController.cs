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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Post>>> GetPosts()
        {
            return await _context.Posts.ToListAsync();
        }

        [HttpGet("users/{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var oneUser = await _context.Users.FindAsync(id);

            if (oneUser == null)
            {
                return NotFound();
            }

            return oneUser;
        }

        [HttpPost("users/create")]
        public async Task<ActionResult<User>> CreateUser([FromBody] User newUser)
        {
            if (ModelState.IsValid)
            {
                PasswordHasher<User> Hasher = new PasswordHasher<User>();
                newUser.Password = Hasher.HashPassword(newUser, newUser.Password);

                _context.Add(newUser);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetUser), new { id = newUser.UserId }, newUser);
            }
            else
            {
                return BadRequest(ModelState);
            }
        }

        [HttpPost("users/login")]
        public async Task<ActionResult<User>> LoginUser([FromBody] User user)
        {
            var oneUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);

            if (oneUser == null)
            {
                return NotFound();
            }

            var hasher = new PasswordHasher<User>();
            var result = hasher.VerifyHashedPassword(user, oneUser.Password, user.Password);

            if (result == 0)
            {
                return BadRequest();
            }

            return oneUser;
        }

        [HttpPost("users/logout")]
        public async Task<ActionResult<User>> LogoutUser([FromBody] User user)
        {
            var oneUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);

            if (oneUser == null)
            {
                return NotFound();
            }

            return oneUser;
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

