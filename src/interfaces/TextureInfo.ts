/**
 * Everything a TXD records about one texture, minus the pixels.
 *
 * txd-reader hands this back as a TXDTexture, which holds a reference to its
 * chunk and so can't be structured-cloned across a transport. This is the
 * plain-data equivalent, for listing a dictionary before deciding what to
 * decode - pair it with getTextureMipmap() to get the pixels.
 */
export default interface TextureInfo {
	/** Texture name, as materials reference it. */
	name: string,

	/**
	 * Name of the separate alpha texture, where one is used. Usually empty -
	 * most textures carry their own alpha channel.
	 */
	alphaName: string,

	/** Dimensions of mipmap level 0. Lower levels halve from here. */
	width: number,
	height: number,

	/** Bits per pixel of the stored data (4, 8, 16, 32). */
	depth: number,

	/**
	 * Storage format as the file declares it - "DXT1", "DXT3", "8888" and so
	 * on. Descriptive only; the reader has already decoded to RGBA.
	 */
	format: string,

	/** Number of mipmap levels present, including level 0. */
	mipmapCount: number,
}
