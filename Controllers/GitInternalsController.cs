using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GitVisualiserAPI.Models;

namespace GitVisualiserAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GitInternalsController : ControllerBase
    {
        private readonly GitInternalContext _context;

        public GitInternalsController(GitInternalContext context)
        {
            _context = context;
        }

        // GET: api/GitInternals
        [HttpGet("{userId}")]
        public async Task<ActionResult<IEnumerable<GitInternal>>> GetGitInternals()
        {
          if (_context.GitInternals == null)
          {
              return NotFound();
          }
            return await _context.GitInternals.ToListAsync();
        }

        // GET: api/GitInternals/5
        [HttpGet("{userId}/{id}")]
        public async Task<ActionResult<GitInternal>> GetGitInternal(string userId, string id)
        {
          if (_context.GitInternals == null)
          {
              return NotFound();
          }
            var gitInternal = await _context.GitInternals.FindAsync(userId, id);

            if (gitInternal == null)
            {
                return NotFound();
            }

            return gitInternal;
        }

        // PUT: api/GitInternals/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{userId}/{id}")]
        public async Task<IActionResult> PutGitInternal(string userId, string id, GitInternal gitInternal)
        {
            if (id != gitInternal.Id)
            {
                return BadRequest();
            }

            _context.Entry(gitInternal).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GitInternalExists(userId, id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/GitInternals
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<GitInternal>> PostGitInternal(GitInternal gitInternal)
        {
          if (_context.GitInternals == null)
          {
              return Problem("Entity set 'GitInternalContext.GitInternals'  is null.");
          }
            _context.GitInternals.Add(gitInternal);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetGitInternal", new { userId = gitInternal.UserId, id = gitInternal.Id }, gitInternal);
        }

        // DELETE: api/GitInternals/5
        [HttpDelete("{userId}/{id}")]
        public async Task<IActionResult> DeleteGitInternal(string userId, string id)
        {
            if (_context.GitInternals == null)
            {
                return NotFound();
            }
            var gitInternal = await _context.GitInternals.FindAsync(userId, id);
            if (gitInternal == null)
            {
                return NotFound();
            }

            _context.GitInternals.Remove(gitInternal);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool GitInternalExists(string userId, string id)
        {
            return (_context.GitInternals?.Any(e => e.Id == id && e.UserId == userId)).GetValueOrDefault();
        }
    }
}
