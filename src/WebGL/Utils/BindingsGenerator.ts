function isUniformValue(value: any) {
	return typeof value !== 'object' || value.isUniformValue;
}

export interface Binding {
	key: string;
	ref: Record<string, any>;
	name: string;
}

function fromArray(
	obj: Record<string, any>,
	propKey: string,
	keys: Array<Binding> = []
): Array<Binding> {
	const array = obj[propKey];

	for (let i = 0; i < array.length; i++) {
		const item = array[i];

		for (const key in item) {
			const prop = item[key];

			if (isUniformValue(prop)) {
				const binding: Binding = {
					name: `${propKey}[${i}].${key}`,
					ref: item,
					key: key
				};

				keys.push(binding);
				continue;
			}

			fromObject(item, key, `${propKey}[${i}].`, keys);
		}
	}

	return keys;
}

function fromObject(
	obj: Record<string, any>,
	propKey: string,
	prefix = '',
	keys: Array<Binding> = []
): Array<Binding> {
	const prop = obj[propKey];

	for (const key in prop) {
		const value = prop[key];

		if (isUniformValue(value)) {
			const binding: Binding = {
				name: prefix + propKey + '.' + key,
				ref: prop,
				key: key
			};

			keys.push(binding);
			continue;
		}

		fromObject(prop, key, prefix + propKey + '.', keys);
	}

	return keys;
}

function generateUniformBindings(
	uniforms: Record<string, any>
): Array<Binding> {
	const keys: Array<Binding> = [];

	for (const propKey in uniforms) {
		const prop = uniforms[propKey];

		if (Array.isArray(prop)) {
			fromArray(uniforms, propKey, keys);
		} else if (typeof prop === 'object') {
			if (prop.value) {
				const binding: Binding = {
					name: propKey,
					key: 'value',
					ref: prop
				};

				keys.push(binding); // Scalar
				continue;
			}

			fromObject(uniforms, propKey, '', keys);
		}
	}

	return keys;
}

export { generateUniformBindings };
