import { hash } from "./util";

class Keyframes {
	name: string;
	style: any;
	_id: string;

	constructor(name: string, style: any) {
		this.name = name;
		this.style = style;
		this._id = `antd-keyframes-${name}-${hash(JSON.stringify(style))}`;
	}

	getName(hashId: string = ""): string {
		return hashId ? `${hashId}-${this.name}` : this.name;
	}
}

export default Keyframes;
