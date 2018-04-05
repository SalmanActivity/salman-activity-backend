export default function healthcheck() {
  return (req, res, next) => {
    res.json('up and running')
  }
}