const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

export function reminderEmail(playerName) {
  return {
    subject: "Your daily baby name guess is ready!",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="font-size:22px;margin-bottom:8px">Time to guess!</h2>
        <p style="color:#555;font-size:15px;line-height:1.6">
          Hi ${playerName},<br/><br/>
          24 hours have passed — your next baby name guess is ready!
          The baby hasn't been born yet, so the mystery is still alive.
        </p>
        <a href="${siteUrl}" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#3B6D11;color:#EAF3DE;text-decoration:none;border-radius:8px;font-weight:500;font-size:15px">
          Make your guess
        </a>
        <p style="color:#aaa;font-size:12px;margin-top:32px">
          You're receiving this because you joined the baby name guessing game.
        </p>
      </div>
    `
  }
}

export function winEmail(playerName) {
  return {
    subject: "You guessed the baby's name!",
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
