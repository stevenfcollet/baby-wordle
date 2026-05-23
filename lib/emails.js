const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

export function reminderEmail(playerName) {
  return {
    subject: "Your daily guess for Thomas and Eline's baby is ready!",
    html: `
       <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="font-size:22px;margin-bottom:8px">Time to guess!</h2>
        <p style="color:#555;font-size:15px;line-height:1.6">
          Hi ${playerName},<br/><br/>
          <img src="https://baby-wordle-v3.vercel.app/Marcel-edm.jpg" style="max-width: 300px; width: 100%; height: auto; border-radius: 15px;"><br/><br/>
          24 hours have passed, and Marcel is still looking for his little brother — go and take your next guess!
          <br/>The baby hasn't been born yet, so the mystery is still alive!
        </p>
        <a href="https://baby-wordle-v3-steven-collet-s-projects.vercel.app/" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#3B6D11;color:#EAF3DE;text-decoration:none;border-radius:8px;font-weight:500;font-size:15px">
          Make your guess
        </a>
        <p style="color:#aaa;font-size:12px;margin-top:32px">
          You're receiving this because you joined the baby name guessing game by Thomas and Eline. 
        </p>
         <p style="color:#555;font-size:15px;line-height:1.6">
          Best of luck!
          Thomas, Eline &amp; Marcel
        </p>
        
        <p style="color:#000;font-size:12px;margin-top:32px;font-style:italic;">
          Experiencing issues? Contact <a href="mailto:steven.f.collet@gmail.com?subject=Baby%20Wordle%20Thomas%20and%20Eline" target="_blank" rel="noopener noreferrer">
  steven.f.collet@gmail.com
</a>
        </p>
      </div>
    `
  }
}

export function winEmail(playerName) {
  return {
    subject: "You guessed the name!",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="font-size:22px;margin-bottom:8px">You got it!</h2>
        <p style="color:#555;font-size:15px;line-height:1.6">
          Hi ${playerName},<br/><br/>
          Amazing — you guessed the baby's name correctly!
          Now keep the secret safe until the baby is born.
        </p>
        <p style="color:#aaa;font-size:12px;margin-top:32px">
          We'll send you an announcement when the baby arrives.
        </p>
      </div>
    `
  }
}

export function announcementEmail(playerName, babyName, won) {
  return {
    subject: "The baby has arrived!",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="font-size:22px;margin-bottom:8px">The baby is here!</h2>
        <p style="color:#555;font-size:15px;line-height:1.6">
          Hi ${playerName},<br/><br/>
          The big moment has arrived. The baby's name is:
        </p>
        <p style="font-size:36px;font-weight:700;letter-spacing:4px;color:#3B6D11;margin:24px 0">${babyName}</p>
        <p style="color:#555;font-size:15px;line-height:1.6">
          ${won
            ? "You guessed it correctly — well done!"
            : "Better luck next time — it was a tough one!"}
        </p>
        <p style="color:#aaa;font-size:12px;margin-top:32px">
          Congratulations to the whole family!
        </p>
      </div>
    `
  }
}
