import Foundation
import AppKit
let path = CommandLine.arguments[1]
guard let img = NSImage(contentsOfFile: path),
      let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else { exit(1) }
let w = cg.width, h = cg.height
var buf = [UInt8](repeating: 0, count: w*h*4)
let ctx = CGContext(data: &buf, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w*4,
                    space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
func rgb(_ x: Int, _ y: Int) -> (Int,Int,Int) { let i = (y*w+x)*4; return (Int(buf[i]), Int(buf[i+1]), Int(buf[i+2])) }
// most common colour in a horizontal band of width 24 around x, to skip text glyphs
func band(_ x: Int, _ y: Int) -> (Int,Int,Int) {
    var counts: [Int: Int] = [:]
    for xx in max(0,x-12)..<min(w,x+12) {
        let c = rgb(xx, y)
        counts[(c.0/4)<<12 | (c.1/4)<<6 | (c.2/4), default: 0] += 1
    }
    let k = counts.max(by: { $0.value < $1.value })!.key
    return (((k>>12)&63)*4, ((k>>6)&63)*4, (k&63)*4)
}
for x in [700, 1200, 2000, 2900] {
    print("=== column x=\(x)  (CSS x=\(x/2)) ===")
    var start = 0
    var cur = band(x, 0)
    for y in 1..<h {
        let c = band(x, y)
        if abs(c.0-cur.0)+abs(c.1-cur.1)+abs(c.2-cur.2) > 10 {
            if y-start >= 6 { print(String(format: "  y %5d..%5d  #%02x%02x%02x   (CSS %6.1f..%6.1f)", start, y, cur.0, cur.1, cur.2, Double(start)/2, Double(y)/2)) }
            start = y; cur = c
        }
    }
    print(String(format: "  y %5d..%5d  #%02x%02x%02x   (CSS %6.1f..%6.1f)", start, h, cur.0, cur.1, cur.2, Double(start)/2, Double(h)/2))
}
