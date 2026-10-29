import XCTest
import SwiftTreeSitter
import TreeSitterJson5Orchard

final class TreeSitterJson5OrchardTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_json5_orchard())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading JSON5 grammar")
    }
}
