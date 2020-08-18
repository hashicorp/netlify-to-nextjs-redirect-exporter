import pkg from "../package.json";
import parseNetlifyRedirects from "../src";

describe(pkg.name, () => {
  describe(":: parseNetlifyRedirects", () => {
    it("should construct Next.js-compatible objects", () => {
      const redirectSource = `/blog/tags/:name/page/*  /blog/category/:name 301!
/blog/tags/:name  /blog/category/:name 301!
/blog/atlas-category /blog/category/atlas 200`;

      const result = parseNetlifyRedirects(redirectSource);

      expect(Object.keys(result).length).toEqual(2);

      expect(result).toEqual(
        expect.objectContaining({
          rewrites: expect.arrayContaining([
            expect.objectContaining({
              source: "/blog/atlas-category",
              destination: "/blog/category/atlas",
            }),
          ]),

          redirects: expect.arrayContaining([
            expect.objectContaining({
              source: "/blog/tags/:name/page/:splat*",
              destination: "/blog/category/:name",
              permanent: true,
            }),
            expect.objectContaining({
              source: "/blog/tags/:name",
              destination: "/blog/category/:name",
              permanent: true,
            }),
          ]),
        })
      );
    });
  });
});
