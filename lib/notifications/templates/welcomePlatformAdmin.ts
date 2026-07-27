export function welcomePlatformAdmin(
  fullName: string,
  companyName: string,
  passwordLink: string
) {
  return {
    subject: `Welcome to GHO - ${companyName}`,

    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <div style="background:#0A3D91;color:#fff;padding:24px;text-align:center">
          <h1>GHO</h1>
          <p>Global Handling Operations</p>
        </div>

        <div style="padding:30px">
          <h2>Welcome ${fullName}</h2>

          <p>
            Your Platform Administrator account has been created for
            <strong>${companyName}</strong>.
          </p>

          <p>
            Click the button below to create your password and activate your
            account.
          </p>

          <p style="text-align:center;margin:40px 0;">
            <a
              href="${passwordLink}"
              style="
                background:#F58220;
                color:white;
                padding:14px 28px;
                text-decoration:none;
                border-radius:8px;
                font-weight:bold;
              "
            >
              Create My Password
            </a>
          </p>

          <p>
            If you were not expecting this email, you can safely ignore it.
          </p>
        </div>

        <div style="
          background:#f5f5f5;
          padding:20px;
          font-size:12px;
          color:#666;
          text-align:center;
        ">
          This email was automatically sent by GHO.<br/>
          Please do not reply to this email.<br/><br/>

          © Corneluis Group Pty Ltd
        </div>
      </div>
    `,
  };
}