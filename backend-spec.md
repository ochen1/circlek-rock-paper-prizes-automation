As part of an automatic idle farm game, we need to write software that will automatically interface with our backend. Multiple session tokens.

Example config file `config.json`:
```json
[
    {
        "phone": "123-456-7890",
        "token": "ef58e850c4379eb0"
    }
]
```


How it works is like this:
```bash
curl --request POST \
  --url https://api.mgame.nu/server-2025-rpp-na-circlek/server.php \
  --compressed \
  --header 'accept: */*' \
  --header 'accept-encoding: gzip, deflate, br, zstd' \
  --header 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  --header 'bm-country: ca' \
  --header 'connection: keep-alive' \
  --header 'content-type: application/json' \
  --header 'host: api.mgame.nu' \
  --header 'origin: https://rockpaperprizes.com' \
  --header 'referer: https://rockpaperprizes.com/' \
  --header 'sec-ch-ua: "Not)A;Brand";v="8", "Chromium";v="138"' \
  --header 'sec-ch-ua-mobile: ?0' \
  --header 'sec-ch-ua-platform: "Linux"' \
  --header 'sec-fetch-dest: empty' \
  --header 'sec-fetch-mode: cors' \
  --header 'sec-fetch-site: cross-site' \
  --header 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36' \
  --data '{"route":"game_start","data":{"type":"rpp","name":"default","session":"dbfba631ff5723ee"}}'
```
And you will get in response 200 OK:
```json
{"videokey":"redbull","prize":{"title":"FREE Circle K Chips (66 g, Any Flavour)","sprite":"xmLxPfh2"},"returnbonus":{"1":{"type":"coin","value":1,"today":true},"2":{"type":"coin","value":2},"3":{"type":"coin","value":3},"4":{"type":"coin","value":4}},"game_id":"e36ab11fceb09e46","time":"2025-08-03T05:06:07-04:00","turn":{"current":1,"max":3},"ads":[]}
```
The prize is pretty important to display to the user, who will check back in once in a while. You must claim this prize once you see it by issuing the following request
```bash
curl --request POST \
  --url https://api.mgame.nu/server-2025-rpp-na-circlek/server.php \
  --compressed \
  --header 'accept: */*' \
  --header 'accept-encoding: gzip, deflate, br, zstd' \
  --header 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  --header 'bm-country: ca' \
  --header 'connection: keep-alive' \
  --header 'content-type: application/json' \
  --header 'host: api.mgame.nu' \
  --header 'origin: https://rockpaperprizes.com' \
  --header 'referer: https://rockpaperprizes.com/' \
  --header 'sec-ch-ua: "Not)A;Brand";v="8", "Chromium";v="138"' \
  --header 'sec-ch-ua-mobile: ?0' \
  --header 'sec-ch-ua-platform: "Linux"' \
  --header 'sec-fetch-dest: empty' \
  --header 'sec-fetch-mode: cors' \
  --header 'sec-fetch-site: cross-site' \
  --header 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36' \
  --data '{"route":"game_end","data":{"type":"rpp","name":"default","session":"dbfba631ff5723ee","game_id":"e36ab11fceb09e46","playtime":null}}'
```
This returns `{"success":true}`.

Wallet can be checked like this:
```bash
curl --request POST \
  --url https://api.mgame.nu/server-2025-rpp-na-circlek/server.php \
  --compressed \
  --header 'accept: */*' \
  --header 'accept-encoding: gzip, deflate, br, zstd' \
  --header 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  --header 'bm-country: ca' \
  --header 'connection: keep-alive' \
  --header 'content-type: application/json' \
  --header 'host: api.mgame.nu' \
  --header 'origin: https://rockpaperprizes.com' \
  --header 'referer: https://rockpaperprizes.com/' \
  --header 'sec-ch-ua: "Not)A;Brand";v="8", "Chromium";v="138"' \
  --header 'sec-ch-ua-mobile: ?0' \
  --header 'sec-ch-ua-platform: "Linux"' \
  --header 'sec-fetch-dest: empty' \
  --header 'sec-fetch-mode: cors' \
  --header 'sec-fetch-site: cross-site' \
  --header 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36' \
  --data '{"route":"wallet_list","data":{"session":"dbfba631ff5723ee","name":"default","getLink":true}}'
# {"vouchers":[{"expires":"2025-08-08 09:06:33+00","created":"2025-08-03 09:06:33+00","title":"FREE Circle K Chips (66 g, Any Flavour)","sprite":"xmLxPfh2","id":"74da43bb01c930e2"}],"walletLink":"https:\/\/circlek.coupons\/c\/J51NfROmWCW1GKPClpCJ"}
```

If you accidentally try to game_start while in cooldown, this will be the response.
```
{"completed":true,"game_id":"e36ab11fceb09e46","prize":{"title":"FREE Circle K Chips (66 g, Any Flavour)","sprite":"xmLxPfh2"},"videokey":"redbull","time":"2025-08-03T05:15:40-04:00","turn":{"current":1,"max":3}}
```

As a professional full-stack engineer, you will write the frontend for our idle game, which allows a user to add new session tokens to their game, and displays the status of each session and prizes in a neat format! The configuration and state files are JSON and located in the same directory as the project. Write your code in Next.js. No security or auth considerations are necessary for now.

Use Typescript and Tailwind.

$ pnpm create next-app
✔ What is your project named? … idle-farm-frontend
✔ Would you like to use TypeScript? … Yes
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like your code inside a `src/` directory? … No
✔ Would you like to use App Router? (recommended) … Yes
✔ Would you like to use Turbopack for `next dev`? … Yes
✔ Would you like to customize the import alias (`@/*` by default)? … Yes
✔ What import alias would you like configured? … @/*



We also keep track and visualize for each session.
{
  "route": "wallet_list",
  "data": {
    "session": "dbfba631ff5723ee",
    "name": "default",
    "getLink": true
  }
}

Should return
{"vouchers":[{"expires":"2025-08-08 09:06:33+00","created":"2025-08-03 09:06:33+00","title":"FREE Circle K Chips (66 g, Any Flavour)","sprite":"xmLxPfh2","id":"74da43bb01c930e2"}],"walletLink":"https:\/\/circlek.coupons\/c\/J51NfROmWCW1GKPClpCJ"}

We have more stats to display:

{"route":"hub","data":{"session":"dbfba631ff5723ee","name":"default"}}

Returns:

{"tomorrow":"2025-08-04T00:00:00-04:00","played_today":true,"completed":1,"won":1,"achievements":0,"rpp_bonus":{"1":{"type":"coin","value":1,"completed":true,"today":true},"2":{"type":"coin","value":2},"3":{"type":"coin","value":3},"4":{"type":"coin","value":4}},"unread_achievements":[]}
