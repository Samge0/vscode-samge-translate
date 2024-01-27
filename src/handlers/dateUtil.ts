

// get specified format date
export function formatDate(date: Date, format: string): string {
    const map: { [key: string]: number } = {
        "M": date.getMonth() + 1, // the month starts from 0
        "d": date.getDate(),
        "h": date.getHours(),
        "m": date.getMinutes(),
        "s": date.getSeconds(),
        "q": Math.floor((date.getMonth() + 3) / 3), // quarter
        "S": date.getMilliseconds() // millisecond
    };

    return format.replace(/([yMdhmsqS])+/g, function(all, t){
	   let v = map[t]?.toString();
        if(t === 'y') {
            return (date.getFullYear() + '').substr(4 - all.length);
        } else if(v !== undefined){
            if(all.length > 1){
                v = '0' + v;
                return v.substr(v.length - all.length);
            }
            return v.toString();
        }
        return all;
    });
}


// get the current date string
export function getCurrDateString(): string {
	return formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss');
}
