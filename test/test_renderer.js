/* global describe, it */
import { SiteIndex, BlockingContainer, NonBlockingContainer } from "./macros";
import WritableStream from "./stream";
import renderer from "../src/renderer";
import assert from "assert";

describe("renderer", _ => {
	it("should generate a render function for streaming HTML documents", done => {
		let stream = new WritableStream();
		let render = renderer(); // defaults to HTML5

		render(stream, "html", null, _ => {
			assert.equal(stream.read(), "<!DOCTYPE html>\n<html></html>");
			done();
		});
	});

	it("should support custom doctypes", done => {
		let stream = new WritableStream();
		let render = renderer("<!DOCTYPE … XHTML …>");

		render(stream, "html", null, _ => {
			assert.equal(stream.read(), "<!DOCTYPE … XHTML …>\n<html></html>");
			done();
		});
	});

	it("should support omitting doctype for HTML fragments", done => {
		let stream = new WritableStream();
		let render = renderer(null);

		render(stream, "html", null, _ => {
			assert.equal(stream.read(), "<html></html>");
			done();
		});
	});

	it("should support blocking mode", done => {
		let stream = new WritableStream();
		let render = renderer(null);

		render(stream, BlockingContainer, null);
		assert.equal(stream.read(),
				"<div><p>…</p><p><i>lorem<em>…</em>ipsum</i></p><p>…</p></div>");
		done();
	});

	it("should detect non-blocking child elements in blocking mode", done => {
		let stream = new WritableStream();
		let render = renderer(null);

		let fn = _ => render(stream, NonBlockingContainer, null);
		assert.throws(fn, /invalid non-blocking operation/);
		done();
	});

	it("should render unknown elements", done => {
		renderFragment("custom-element", null, html => {
			assert.equal(html, "<custom-element></custom-element>");
			done();
		});
	});

	it("should perform markup expansion for macros", done => {
		renderFragment(SiteIndex, { title: "hello world" }, html => {
			assert.equal(html, "<html>" +
					'<head><meta charset="utf-8"><title>hello world</title></head>' +
					"<body><h1>hello world</h1><p>…</p></body>" +
					"</html>");
			done();
		});
	});
});

function renderFragment(tag, params, callback) {
	let render = renderer(null);
	let stream = new WritableStream();
	render(stream, tag, params, _ => {
		let html = stream.read();
		callback(html);
	});
}
