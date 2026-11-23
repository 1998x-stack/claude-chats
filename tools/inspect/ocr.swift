import Foundation
import Vision
import AppKit

let path = CommandLine.arguments[1]
guard let img = NSImage(contentsOfFile: path),
      let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    print("cannot load"); exit(1)
}
let req = VNRecognizeTextRequest()
req.recognitionLevel = .accurate
req.usesLanguageCorrection = false
req.recognitionLanguages = ["zh-Hans", "en-US"]
let handler = VNImageRequestHandler(cgImage: cg, options: [:])
try handler.perform([req])
for obs in (req.results ?? []) {
    guard let c = obs.topCandidates(1).first else { continue }
    let bb = obs.boundingBox
    let x = Int(bb.minX * Double(cg.width))
    let y = Int((1 - bb.maxY) * Double(cg.height))
    print("[\(x),\(y)] \(c.string)")
}
