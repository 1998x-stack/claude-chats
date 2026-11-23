import Foundation
import AppKit
let path = CommandLine.arguments[1]
let CW = Int(CommandLine.arguments[2]) ?? 110
let CH = Int(CommandLine.arguments[3]) ?? 46
guard let img = NSImage(contentsOfFile: path),
      let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else { exit(1) }
let w = cg.width, h = cg.height
var buf = [UInt8](repeating: 0, count: w*h*4)
let ctx = CGContext(data: &buf, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w*4,
                    space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
let ramp = Array(" .:-=+*#%@")
print("luminance map \(w)x\(h) -> \(CW)x\(CH)   (chars: ' .:-=+*#%@' dark->bright)")
var hdr = "     "
for c in stride(from: 0, to: CW, by: 10) { let s = "\(c*8/2)".padding(toLength: 10, withPad: " ", startingAt: 0); hdr += s }
print("x(px)  " + hdr)
for cy in 0..<CH {
    let y0 = cy*h/CH, y1 = max(y0+1,(cy+1)*h/CH)
    var row = ""
    for cx in 0..<CW {
        let x0 = cx*w/CW, x1 = max(x0+1,(cx+1)*w/CW)
        var sum = 0, n = 0
        for y in stride(from: y0, to: y1, by: 2) {
            for x in stride(from: x0, to: x1, by: 2) {
                let i = (y*w+x)*4
                sum += (Int(buf[i])*299 + Int(buf[i+1])*587 + Int(buf[i+2])*114)/1000; n += 1
            }
        }
        let lum = n > 0 ? sum/n : 0
        row.append(ramp[min(ramp.count-1, max(0, lum*ramp.count/256))])
    }
    print(String(format: "y%5d %@", y0, row))
}
