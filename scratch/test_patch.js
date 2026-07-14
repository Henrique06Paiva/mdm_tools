const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlkyOXVaV04wYUhWek1qQXlNMEZEVEZGQiJ9.eyJ1c2VybmFtZSI6InJvb3QiLCJzdWIiOiIxIiwiY29ycG9yYXRpb25JZCI6MSwiY29tcGFueUlkIjoxLCJzdWJzaWRpYXJ5SWQiOjEsInNoSWQiOm51bGwsInJlcHJlc2VudGF0aXZlSWQiOm51bGwsImZpcnN0QWNjZXNzIjpmYWxzZSwidGVuYW50cyI6W3siaWQiOjEsImNvZGUiOiJyb290In0seyJpZCI6MiwiY29kZSI6InBvcnRhbCJ9LHsiaWQiOjMsImNvZGUiOiJtcnAifV0sInBlcm1pc3Npb25zIjpbXSwiY29ycG9yYXRpb25XaXRoRnVsbEFjY2VzcyI6W10sImNvbXBhbmllc1dpdGhGdWxsQWNjZXNzIjpbXSwiY29tcGFueUlkcyI6W10sInN1YnNpZGlhcnlJZHMiOltdLCJpc1Jvb3RVc2VyIjp0cnVlLCJpc0NvcnBVc2VyIjpmYWxzZSwiaXNDb21wYW55VXNlciI6ZmFsc2UsImlzUm9vdFJlcCI6ZmFsc2UsImlzUmVwVXNlciI6ZmFsc2UsImlzVHdvRmFjdG9yRW5hYmxlZCI6ZmFsc2UsImlzU0hVc2VyIjpmYWxzZSwicm9sZUlkcyI6WzIsNCw2XSwibGltaXRFcXVpcG1lbnRzQWN0aXZlIjpbeyJpZCI6MSwibHQiOjB9LHsiaWQiOjIwLCJsdCI6Mzk3fSx7ImlkIjoxMjUsImx0IjoyNDJ9LHsiaWQiOjY4LCJsdCI6NTAwMH0seyJpZCI6NTEsImx0IjoxMDAwfSx7ImlkIjo0MywibHQiOjQwMH0seyJpZCI6MTIsImx0Ijo1MH0seyJpZCI6MzMsImx0IjoyMDAwMH0seyJpZCI6NDQsImx0Ijo1MH0seyJpZCI6MTUsImx0IjoxMzk5NX0seyJpZCI6MzAsImx0IjoxMjZ9LHsiaWQiOjE0LCJsdCI6MH0seyJpZCI6ODEsImx0IjoxMDB9LHsiaWQiOjcyLCJsdCI6MTB9LHsiaWQiOjIxLCJsdCI6MTI1fSx7ImlkIjoxMDksImx0IjoxMH0seyJpZCI6NDIsImx0Ijo1MDB9LHsiaWQiOjIyLCJsdCI6NTB9LHsiaWQiOjEzLCJsdCI6MTB9LHsiaWQiOjU3LCJsdCI6NTAwMH0seyJpZCI6NiwibHQiOjEwMH0seyJpZCI6NzgsImx0Ijo1fSx7ImlkIjo5LCJsdCI6NTAwMH0seyJpZCI6NSwibHQiOjUwMH0seyJpZCI6NTAsImx0Ijo1MH0seyJpZCI6NTQsImx0IjoyMDB9LHsiaWQiOjYyLCJsdCI6MTB9LHsiaWQiOjc0LCJsdCI6MTB9LHsiaWQiOjYzLCJsdCI6MTB9LHsiaWQiOjcxLCJsdCI6MTB9LHsiaWQiOjcwLCJsdCI6MTB9LHsiaWQiOjY2LCJsdCI6MTB9LHsiaWQiOjgsImx0Ijo1MH0seyJpZCI6MTI5LCJsdCI6MTB9LHsiaWQiOjgwLCJsdCI6MTAwMDAwfSx7ImlkIjo0NiwibHQiOjEwfSx7ImlkIjo0OCwibHQiOjE1fSx7ImlkIjo2NCwibHQiOjEzNX0seyJpZCI6NzcsImx0IjoxMH0seyJpZCI6MiwibHQiOjM1MDAwfSx7ImlkIjo5NCwibHQiOjEwfSx7ImlkIjo4MiwibHQiOjEwfSx7ImlkIjo4MywibHQiOjEwfSx7ImlkIjo5OCwibHQiOjV9LHsiaWQiOjEwMCwibHQiOjEwfSx7ImlkIjoxMjQsImx0IjoxMH0seyJpZCI6MTAxLCJsdCI6MTAwfSx7ImlkIjo5NiwibHQiOjEwMDAwMH0seyJpZCI6NDQsImx0Ijo1MH0seyJpZCI6ODgsImx0Ijo1MDAwfSx7ImlkIjo2NSwibHQiOjEwMH0seyJpZCI6MTE1LCJsdCI6MTEwfSx7ImlkIjoxMjAsImx0IjoyNTV9LHsiaWQiOjk5LCJsdCI6MTB9LHsiaWQiOjEwMiwibHQiOjEwfSx7ImlkIjoxOCwibHQiOjEwMDB9LHsiaWQiOjk1LCJsdCI6MTB9LHsiaWQiOjk3LCJsdCI6MTB9LHsiaWQiOjg3LCJsdCI6MTB9LHsiaWQiOjkwLCJsdCI6NX0seyJpZCI6MjUsImx0Ijo0MH0seyJpZCI6MzYsImx0IjoxMDAwMH0seyJpZCI6MTA2LCJsdCI6MTB9LHsiaWQiOjExOCwibHQiOjI1MH0seyJpZCI6MTA4LCJsdCI6MTAwfSx7ImlkIjoxMDUgLCJsdCI6MTB9LHsiaWQiOjExNCwibHQiOjEwfSx7ImlkIjoxMTMsImx0Ijo0MH0seyJpZCI6MTAzLCJsdCI6MjAwfSx7ImlkIjo5MSwibHQiOjUwMH0seyJpZCI6OTMsImx0IjoyMDAwfSx7ImlkIjoyOCwibHQiOjQ1MH0seyJpZCI6MTA3LCJsdCI6MTUwMH0seyJpZCI6Mzku\ndG8iOjIwMH0seyJpZCI6MTE5LCJsdCI6MTB9LHsiaWQiOjkyLCJsdCI6MTAwMH0seyJpZCI6MTA0LCJsdCI6\nMTV9LHsiaWQiOjQsImx0Ijo2NDh9LHsiaWQiOjdeLCJsdCI6ODUwfSx7ImlkIjoxMjIsImx0Ijo5OTk5fSx7\nImlkIjoxMjMsImx0IjoxMDB9LHsiaWQiOjEyNiwibHQiOjEwMDB9LHsiaWQiOjEyNywibHQiOjEwfSx7Imlk\nIjo2MSwibHQiOjEwfSx7ImlkIjoxMjgsImx0Ijo3MH0seyJpZCI6MTE2LCJsdCI6MTU1MH0seyJpZCI6MTIx\nLCJsdCI6MTB9LHsiaWQiOjEzMCwibHQiOjEwfV0sInVzZXJTdGF0dXMiOjEsImhhc0xpbWl0RXhjZWVkZWQi\nOmZhbHNlLCJpc3MiOiJhdXRoLXNlcnZpY2UiLCJpYXQiOjE3ODM1MzAyMDcsImV4cCI6MTc4MzUzMTEwN30.\nE5JAl_zlB8AQT9TC8l7tfAD27VWfKgibVkP3EuHHM1IdYj4T9mt8ocCtWOYboNl4S5cwkmpAbgv9nyWvnUmm\n8jnbMdgf-QSJuI1R4j7nHGSf9Z0f6QXUEX26KaP0Hs_4myslOtM0lN8zFjs1XeZUdlSh3gV7c04f6bUJzxQj\n5pTRw5MIOPiRT8aLd1tJgCNhbYtC9Kcnqh1AYiVl0w1QxMqgu4860eIvuG0ifOMfrH0QQKU3FZQmOJCvth8h\nQpuKdZiu5YrKU8yP8nLhWR6BWyQGiZKjCA8bNahtRwMnH_sx-uGVr3w-FQqYG9M0bXJPm8eByD13rgDaAYeQ\npi3JYQ";

const body = {
  status: 0,
  isTwoFactorEnabled: false,
  fullName: "Herique Esteves de Paiva",
  phone: "11950089975",
  email: "henriqueesteves06@gmail.com",
  corporationId: 10,
  companyId: 17,
  subsidiaryId: 117,
  roleIds: [20],
  corporationAccesses: [
    {
      corporationId: 10,
      companyId: null,
      subsidiaryId: null
    }
  ]
};

async function test() {
  try {
    const response = await fetch("https://api.gateway.mdm-hub.com/api-acl/user/655", {
      method: "PATCH",
      headers: {
        "accept": "application/json, text/plain, */*",
        "accept-language": "pt-BR",
        "authorization": `Bearer ${token.replace(/\s+/g, '')}`,
        "content-type": "application/json",
        "origin": "https://portal.mdm-hub.com.br",
        "x-tenant-code": "portal"
      },
      body: JSON.stringify(body)
    });
    
    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Body:", text);
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

test();
