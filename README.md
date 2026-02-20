# AstroRapper

A REST API wrapper for the [Astrolog](https://www.astrolog.org/astrolog.htm) CLI astrology software. AstroRapper exposes natal chart and transit calculations as JSON endpoints, making it easy to integrate Astrolog's powerful computation engine into web apps and services.

## Prerequisites

- **Node.js** >= 18
- **Astrolog** binary compiled and accessible on your system ([source](https://www.astrolog.org/astrolog/ast.htm))

## Setup

```bash
git clone https://github.com/antman786/AstroRapper.git
cd AstroRapper
npm install
cp .env.example .env
```

Edit `.env` to point to your Astrolog binary:

```
ASTROLOG_PATH=~/Documents/Astrolog/astrolog
PORT=3000
ASTROLOG_TIMEOUT=10000
```

## Usage

```bash
npm start
```

The server starts on `http://localhost:3000` by default.

## API Endpoints

### `GET /api/health`

Health check — verifies the server is running and the Astrolog binary is accessible.

```json
{ "status": "ok", "astrolog": "/path/to/astrolog", "accessible": true }
```

### `POST /api/natal`

Calculate a natal chart.

**Request body:**

| Field       | Type    | Required | Description                     |
|-------------|---------|----------|---------------------------------|
| `month`     | integer | yes      | Birth month (1–12)              |
| `day`       | integer | yes      | Birth day (1–31)                |
| `year`      | integer | yes      | Birth year (1–9999)             |
| `time`      | string  | no       | Birth time `"HH:MM"` (24h)     |
| `latitude`  | float   | yes      | Birth latitude (-90 to 90)      |
| `longitude` | float   | yes      | Birth longitude (-180 to 180)   |
| `timezone`  | float   | yes      | UTC offset (-24 to 24)          |

**Example:**

```bash
curl -X POST http://localhost:3000/api/natal \
  -H "Content-Type: application/json" \
  -d '{"month":7,"day":29,"year":1991,"time":"18:23","latitude":40.7484,"longitude":-73.9857,"timezone":-5}'
```

**Response:**

```json
{
  "success": true,
  "command": "astrolog -q 7 29 1991 18:23 -zl -73.9857 40.7484 -z -5",
  "output": "..."
}
```

### `POST /api/transit`

Calculate transits for a natal chart against a given date or month.

**Request body:**

| Field              | Type    | Required | Description                          |
|--------------------|---------|----------|--------------------------------------|
| `natal.month`      | integer | yes      | Birth month                          |
| `natal.day`        | integer | yes      | Birth day                            |
| `natal.year`       | integer | yes      | Birth year                           |
| `natal.time`       | string  | no       | Birth time `"HH:MM"`                 |
| `natal.latitude`   | float   | yes      | Birth latitude                       |
| `natal.longitude`  | float   | yes      | Birth longitude                      |
| `natal.timezone`   | float   | yes      | UTC offset                           |
| `transit.month`    | integer | yes      | Transit month                        |
| `transit.year`     | integer | yes      | Transit year                         |
| `transit.day`      | integer | no       | Transit day (omit for whole month)   |

**Example:**

```bash
curl -X POST http://localhost:3000/api/transit \
  -H "Content-Type: application/json" \
  -d '{
    "natal": {"month":7,"day":29,"year":1991,"time":"18:23","latitude":40.7484,"longitude":-73.9857,"timezone":-5},
    "transit": {"month":2,"day":20,"year":2026}
  }'
```

## Testing

```bash
npm test
```

## License

This project is licensed under the **GNU General Public License v2.0 or later** — see [LICENSE](LICENSE) for details.

AstroRapper is a derivative work that interfaces with [Astrolog](https://www.astrolog.org/astrolog.htm) by Walter Pullen, which is released under the GPL v2.0+.
